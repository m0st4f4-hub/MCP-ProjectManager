#!/usr/bin/env python3
"""
Backend-Frontend Integration Testing Suite
This script tests the alignment between backend and frontend APIs.
"""

import asyncio
import aiohttp
import sys
import time


class APIAlignmentTester:
    def __init__(
        self,
        backend_url="http://localhost:8000",
        frontend_url="http://localhost:3000",
    ):
        self.backend_url = backend_url
        self.frontend_url = frontend_url
        self.test_results = []

    async def test_backend_health(self) -> bool:
        """Test backend health endpoint."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.backend_url}/health"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        print("✅ Backend health check passed")
                        print(f"   Status: {data.get('status')}")
                        print(f"   Database: {data.get('database')}")
                        return True
                    else:
                        print(
                            f"❌ Backend health check failed: {response.status}"
                        )
                        return False
        except Exception as e:
            print(f"❌ Backend health check error: {e}")
            return False

    async def test_backend_openapi(self) -> bool:
        """Test backend OpenAPI documentation."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.backend_url}/openapi.json"
                ) as response:
                    if response.status == 200:
                        openapi_spec = await response.json()
                        paths = openapi_spec.get('paths', {})
                        print(
                            "✅ OpenAPI spec loaded with "
                            f"{len(paths)} endpoints"
                        )
                        required_endpoints = [
                            '/api/projects/',
                            '/api/projects/{project_id}',
                            '/api/projects/{project_id}/archive',
                            '/api/projects/{project_id}/members',
                            '/api/projects/{project_id}/tasks',
                            '/api/tasks/',
                            '/health'
                        ]

                        missing_endpoints = []
                        for endpoint in required_endpoints:
                            if endpoint not in paths:
                                missing_endpoints.append(endpoint)

                        if missing_endpoints:
                            print(
                                f"⚠️  Missing endpoints: {missing_endpoints}"
                            )
                            return False

                        print(
                            "✅ All required endpoints present in OpenAPI spec"
                        )
                        return True
                    else:
                        print(
                            f"❌ OpenAPI spec fetch failed: {response.status}"
                        )
                        return False
        except Exception as e:
            print(f"❌ OpenAPI spec test error: {e}")
            return False

    async def test_projects_api(self) -> bool:
        """Test projects API endpoints."""
        print("\n🧪 Testing Projects API...")

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.backend_url}/api/projects/"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'data' in data and isinstance(data['data'], list):
                            print(
                                "✅ Projects list endpoint returns "
                                "correct format"
                            )
                            print(f"   Found {len(data['data'])} projects")
                        else:
                            print(
                                "❌ Projects list endpoint returns "
                                "unexpected format"
                            )
                            return False
                    else:
                        print(
                            f"❌ Projects list failed: {response.status}"
                        )
                        return False
                test_project = {
                    "name": f"Test Project {int(time.time())}",
                    "description": "Integration test project"
                }

                async with session.post(
                    f"{self.backend_url}/api/projects/",
                    json=test_project,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'data' in data and 'id' in data['data']:
                            project_id = data['data']['id']
                            print("✅ Project creation successful")
                            async with session.get(
                                f"{self.backend_url}/api/projects/{project_id}"
                            ) as get_response:
                                if get_response.status == 200:
                                    print("✅ Project retrieval successful")
                                    return True
                                else:
                                    print(
                                        "❌ Project retrieval failed: "
                                        f"{get_response.status}"
                                    )
                                    return False
                        else:
                            print(
                                "❌ Project creation returned unexpected format"
                            )
                            return False
                    else:
                        print(
                            f"❌ Project creation failed: {response.status}"
                        )
                        response_text = await response.text()
                        print(f"   Response: {response_text}")
                        return False

        except Exception as e:
            print(f"❌ Projects API test error: {e}")
            return False

    async def test_response_format_alignment(self) -> bool:
        """Test that backend responses align with frontend expectations."""
        print("\n🔍 Testing Response Format Alignment...")

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.backend_url}/api/projects/"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        required_fields = [
                            'data',
                            'success',
                            'message',
                            'timestamp',
                        ]
                        missing_fields = [
                            field
                            for field in required_fields
                            if field not in data
                        ]

                        if missing_fields:
                            print(
                                f"❌ Missing response fields: {missing_fields}"
                            )
                            return False

                        print(
                            "✅ Backend returns standardized response format"
                        )
                        if isinstance(data['data'], list):
                            print(
                                "✅ Projects data is properly wrapped"
                            )
                            return True
                        else:
                            print(
                                "❌ Projects data format incorrect"
                            )
                            return False
                    else:
                        print(
                            f"❌ Response format test failed: {response.status}"
                        )
                        return False

        except Exception as e:
            print(f"❌ Response format test error: {e}")
            return False

    async def run_all_tests(self) -> bool:
        """Run all integration tests."""
        print("🧪 Backend-Frontend Integration Test Suite")
        print("=" * 50)

        tests = [
            ("Backend Health", self.test_backend_health),
            ("OpenAPI Specification", self.test_backend_openapi),
            ("Projects API", self.test_projects_api),
            ("Response Format Alignment", self.test_response_format_alignment),
        ]

        passed_tests = 0
        total_tests = len(tests)

        for test_name, test_func in tests:
            print(f"\n🔬 Running {test_name} test...")
            try:
                result = await test_func()
                if result:
                    passed_tests += 1
                print(f"✅ {test_name} test PASSED")
            except Exception as e:
                print(f"❌ {test_name} test ERROR: {e}")

        print(f"\n📊 Test Results: {passed_tests}/{total_tests} tests passed")

        if passed_tests == total_tests:
            print("🎉 All integration tests PASSED!")
            return True
        else:
            print("❌ Some integration tests FAILED")
            return False


async def main():
    """Main test function."""
    tester = APIAlignmentTester()
    success = await tester.run_all_tests()

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
