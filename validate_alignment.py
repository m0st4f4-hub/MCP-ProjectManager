#!/usr/bin/env python3
"""
Frontend-Backend Feature Alignment Validator
This script validates that all frontend features have corresponding backend implementations.
"""

import asyncio
import aiohttp
import json
import sys
import subprocess
from typing import Dict, List, Any, Tuple
import time

class FeatureAlignmentValidator:
    def __init__(self, backend_url="http://localhost:8000"):
        self.backend_url = backend_url
        self.validation_results = []
        self.backend_process = None
        self.auth_token = None

    async def _start_backend(self):
        """Start the backend server if it's not already running."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.backend_url}/health", timeout=2) as resp:
                    if resp.status == 200:
                        return True
        except Exception:
            pass

        cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"]
        self.backend_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        await asyncio.sleep(5)
        return True

    async def _get_auth_token(self):
        """Retrieve authentication token for default admin user."""
        login_url = f"{self.backend_url}/api/v1/auth/login"
        payload = {"username": "admin", "password": "secret"}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(login_url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        self.auth_token = data.get("access_token")
                        return True
        except Exception:
            pass
        return False

    async def _stop_backend(self):
        if self.backend_process:
            self.backend_process.terminate()
            try:
                await asyncio.sleep(1)
                self.backend_process.kill()
            except Exception:
                pass
        
    async def validate_project_features(self) -> List[Tuple[str, bool, str]]:
        """Validate all project-related features."""
        results = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test project CRUD
                results.append(await self._test_endpoint(session, "GET", "/api/v1/projects/", "List projects"))
                
                # Test project creation
                test_project = {"name": f"Validation Project {int(time.time())}", "description": "Feature validation test"}
                create_result = await self._test_endpoint(session, "POST", "/api/v1/projects/", "Create project", test_project)
                results.append(create_result)
                
                if create_result[1]:  # If creation succeeded
                    # Extract project ID from response for further testing
                    async with session.post(f"{self.backend_url}/api/v1/projects/", json=test_project) as response:
                        if response.status == 200:
                            data = await response.json()
                            project_id = data.get('data', {}).get('id')
                            
                            if project_id:
                                # Test project-specific endpoints
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}", "Get project by ID"))
                                results.append(await self._test_endpoint(session, "POST", f"/api/v1/projects/{project_id}/archive", "Archive project"))
                                results.append(await self._test_endpoint(session, "POST", f"/api/v1/projects/{project_id}/unarchive", "Unarchive project"))
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/members", "Get project members"))
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/files", "Get project files"))
                
                # Test planning endpoint
                planning_data = {"goal": "Test planning feature"}
                results.append(await self._test_endpoint(session, "POST", "/api/v1/projects/generate-planning-prompt", "Generate planning prompt", planning_data))
                
        except Exception as e:
            results.append(("Project features validation", False, f"Error: {e}"))
            
        return results
    
    async def validate_task_features(self) -> List[Tuple[str, bool, str]]:
        """Validate all task-related features."""
        results = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test global tasks endpoint
                results.append(await self._test_endpoint(session, "GET", "/api/v1/tasks/", "List all tasks"))
                
                # Create a test project first for task testing
                test_project = {"name": f"Task Test Project {int(time.time())}", "description": "Task feature validation"}
                async with session.post(f"{self.backend_url}/api/v1/projects/", json=test_project) as response:
                    if response.status == 200:
                        data = await response.json()
                        project_id = data.get('data', {}).get('id')
                        
                        if project_id:
                            # Test project tasks
                            results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/tasks", "List project tasks"))
                            
                            # Test task creation
                            test_task = {"title": f"Test Task {int(time.time())}", "description": "Task validation test"}
                            task_result = await self._test_endpoint(session, "POST", f"/api/v1/projects/{project_id}/tasks/", "Create task", test_task)
                            results.append(task_result)
                            
                            if task_result[1]:  # If task creation succeeded
                                # Test task-specific endpoints (assuming task_number is 1 for first task)
                                task_number = 1
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/tasks/{task_number}", "Get task by ID"))
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/tasks/{task_number}/comments/", "Get task comments"))
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/tasks/{task_number}/dependencies/", "Get task dependencies"))
                                results.append(await self._test_endpoint(session, "GET", f"/api/v1/projects/{project_id}/tasks/{task_number}/files/", "Get task files"))
                                results.append(await self._test_endpoint(session, "POST", f"/api/v1/projects/{project_id}/tasks/{task_number}/archive", "Archive task"))
                                results.append(await self._test_endpoint(session, "POST", f"/api/v1/projects/{project_id}/tasks/{task_number}/unarchive", "Unarchive task"))
                
        except Exception as e:
            results.append(("Task features validation", False, f"Error: {e}"))
            
        return results
    
    async def validate_agent_features(self) -> List[Tuple[str, bool, str]]:
        """Validate all agent-related features."""
        results = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test agent endpoints
                results.append(await self._test_endpoint(session, "GET", "/api/v1/agents", "List agents"))
                
                # Test agent creation
                test_agent = {"name": f"Test Agent {int(time.time())}", "description": "Agent validation test", "agent_type": "test"}
                create_result = await self._test_endpoint(session, "POST", "/api/v1/agents/", "Create agent", test_agent)
                results.append(create_result)
                
                if create_result[1]:  # If creation succeeded
                    # Test agent by name endpoint
                    agent_name = test_agent["name"]
                    results.append(await self._test_endpoint(session, "GET", f"/api/v1/agents/{agent_name}", "Get agent by name"))
                
        except Exception as e:
            results.append(("Agent features validation", False, f"Error: {e}"))
            
        return results
    
    async def validate_memory_features(self) -> List[Tuple[str, bool, str]]:
        """Validate memory/knowledge graph features."""
        results = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test memory endpoints
                results.append(await self._test_endpoint(session, "GET", "/api/memory", "List memory entities"))
                results.append(await self._test_endpoint(session, "GET", "/api/memory/graph", "Get knowledge graph"))
                results.append(await self._test_endpoint(session, "GET", "/api/memory/search?q=test", "Search memory"))
                
        except Exception as e:
            results.append(("Memory features validation", False, f"Error: {e}"))
            
        return results
    
    async def validate_rules_features(self) -> List[Tuple[str, bool, str]]:
        """Validate rules and mandates features."""
        results = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test rules endpoints
                results.append(await self._test_endpoint(session, "GET", "/api/rules/mandates", "List universal mandates"))
                results.append(await self._test_endpoint(session, "GET", "/api/rules/templates", "List rule templates"))
                
        except Exception as e:
            results.append(("Rules features validation", False, f"Error: {e}"))
            
        return results
    
    async def _test_endpoint(self, session: aiohttp.ClientSession, method: str, path: str, description: str, data: dict = None) -> Tuple[str, bool, str]:
        """Test a single endpoint."""
        try:
            url = f"{self.backend_url}{path}"
            kwargs = {"method": method.upper()}

            if data:
                kwargs["json"] = data
                kwargs["headers"] = {"Content-Type": "application/json"}
            else:
                kwargs["headers"] = {}

            if self.auth_token:
                kwargs["headers"]["Authorization"] = f"Bearer {self.auth_token}"
            
            async with session.request(**kwargs, url=url) as response:
                if response.status < 400:
                    return (description, True, f"✅ {method} {path} - Status: {response.status}")
                else:
                    response_text = await response.text()
                    return (description, False, f"❌ {method} {path} - Status: {response.status}, Response: {response_text[:100]}")
                    
        except Exception as e:
            return (description, False, f"❌ {method} {path} - Error: {str(e)}")
    
    async def run_full_validation(self) -> bool:
        """Run complete frontend-backend feature alignment validation."""
        print("🔍 Frontend-Backend Feature Alignment Validation")
        print("=" * 60)

        await self._start_backend()

        # Test backend connectivity first
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.backend_url}/health") as response:
                    if response.status != 200:
                        print("❌ Backend health check failed - cannot proceed with validation")
                        await self._stop_backend()
                        return False
                    print("✅ Backend connectivity confirmed")
            if not await self._get_auth_token():
                print("❌ Failed to retrieve auth token")
                await self._stop_backend()
                return False
        except Exception as e:
            print(f"❌ Cannot connect to backend at {self.backend_url}: {e}")
            await self._stop_backend()
            return False
        
        # Run all validations
        validation_suites = [
            ("Project Features", self.validate_project_features),
            ("Task Features", self.validate_task_features),
            ("Agent Features", self.validate_agent_features),
            ("Memory Features", self.validate_memory_features),
            ("Rules Features", self.validate_rules_features),
        ]
        
        all_results = []
        total_passed = 0
        total_tests = 0
        
        for suite_name, validation_func in validation_suites:
            print(f"\n🧪 Testing {suite_name}")
            print("-" * 40)
            
            results = await validation_func()
            all_results.extend(results)
            
            suite_passed = 0
            for description, passed, details in results:
                total_tests += 1
                if passed:
                    suite_passed += 1
                    total_passed += 1
                    print(f"  {details}")
                else:
                    print(f"  {details}")
            
            print(f"  📊 {suite_name}: {suite_passed}/{len(results)} tests passed")
        
        # Final summary
        print(f"\n📊 Overall Results: {total_passed}/{total_tests} tests passed")
        success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        print(f"🎯 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Frontend-Backend alignment is EXCELLENT!")
            result = True
        elif success_rate >= 60:
            print("✅ Frontend-Backend alignment is GOOD - minor issues detected")
            result = True
        else:
            print("⚠️  Frontend-Backend alignment needs IMPROVEMENT")
            result = False

        await self._stop_backend()
        return result

async def main():
    """Main validation function."""
    validator = FeatureAlignmentValidator()
    success = await validator.run_full_validation()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
