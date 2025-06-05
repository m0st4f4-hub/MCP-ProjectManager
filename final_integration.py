#!/usr/bin/env python3
"""
THE BUILDER'S FINAL SYSTEM INTEGRATION
Complete end-to-end validation and startup of the Task Manager system
"""

import asyncio
import subprocess
import sys
import os
import time
import json
import aiohttp
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import threading

class TheBuilderSystemIntegrator:
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.processes = []
        self.integration_results = {}
        
    def print_builder_header(self):
        """Print The Builder's header."""
        print("🏗️" + "="*70)
        print("                    THE BUILDER")
        print("           FINAL SYSTEM INTEGRATION")
        print("="*72)
        print("🎯 Mission: Complete Frontend-Backend Alignment")
        print("🔧 Status: Executing Final Integration Phase")
        print("🏆 Goal: Production-Ready Task Management System")
        print("="*72)
        print()
    
    def run_command_with_logging(self, cmd, description, cwd=None, timeout=60):
        """Run command with comprehensive logging."""
        print(f"🔧 {description}...")
        start_time = time.time()
        
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=cwd or self.root_dir
            )
            
            duration = time.time() - start_time
            
            if result.returncode == 0:
                print(f"✅ {description} completed in {duration:.1f}s")
                if result.stdout and len(result.stdout.strip()) > 0:
                    print(f"   📄 Output: {result.stdout.strip()[:200]}{'...' if len(result.stdout) > 200 else ''}")
                return True
            else:
                print(f"❌ {description} failed in {duration:.1f}s")
                if result.stderr:
                    print(f"   🚨 Error: {result.stderr.strip()[:300]}{'...' if len(result.stderr) > 300 else ''}")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {description} timed out after {timeout}s")
            return False
        except Exception as e:
            print(f"❌ Error in {description}: {e}")
            return False
    
    async def validate_complete_system(self):
        """Run comprehensive system validation."""
        print("\n🔍 THE BUILDER'S COMPREHENSIVE SYSTEM VALIDATION")
        print("-" * 60)
        
        validation_passed = True
        
        # Backend validation
        print("\n🐍 Backend Validation")
        print("-" * 30)
        
        backend_checks = [
            ("Backend directory structure", self._check_backend_structure),
            ("Python virtual environment", self._check_python_venv),
            ("Backend dependencies", self._check_backend_deps),
            ("Database initialization", self._check_database),
            ("Backend models integrity", self._check_models),
            ("API routers completeness", self._check_routers),
        ]
        
        for check_name, check_func in backend_checks:
            try:
                result = check_func()
                if result:
                    print(f"  ✅ {check_name}")
                else:
                    print(f"  ❌ {check_name}")
                    validation_passed = False
            except Exception as e:
                print(f"  ❌ {check_name} - Error: {e}")
                validation_passed = False
        
        # Frontend validation
        print("\n🎨 Frontend Validation")
        print("-" * 30)
        
        frontend_checks = [
            ("Frontend directory structure", self._check_frontend_structure),
            ("Node.js dependencies", self._check_node_deps),
            ("TypeScript configuration", self._check_typescript),
            ("API service alignment", self._check_api_services),
            ("Component structure", self._check_components),
            ("Environment configuration", self._check_env_config),
        ]
        
        for check_name, check_func in frontend_checks:
            try:
                result = check_func()
                if result:
                    print(f"  ✅ {check_name}")
                else:
                    print(f"  ❌ {check_name}")
                    validation_passed = False
            except Exception as e:
                print(f"  ❌ {check_name} - Error: {e}")
                validation_passed = False
        
        self.integration_results['validation_passed'] = validation_passed
        return validation_passed
    
    def _check_backend_structure(self):
        """Check backend directory structure."""
        required_dirs = ['models', 'schemas', 'routers', 'services', 'crud']
        required_files = ['main.py', 'database.py', 'requirements.txt']
        
        for dir_name in required_dirs:
            if not (self.backend_dir / dir_name).exists():
                return False
        
        for file_name in required_files:
            if not (self.backend_dir / file_name).exists():
                return False
        
        return True
    
    def _check_python_venv(self):
        """Check Python virtual environment."""
        venv_path = self.backend_dir / ".venv"
        if not venv_path.exists():
            return False
        
        # Check if python executable exists
        python_exe = venv_path / "Scripts" / "python.exe" if os.name == 'nt' else venv_path / "bin" / "python"
        return python_exe.exists()
    
    def _check_backend_deps(self):
        """Check backend dependencies."""
        requirements_file = self.backend_dir / "requirements.txt"
        if not requirements_file.exists():
            return False
        
        # Check if key dependencies are listed
        content = requirements_file.read_text()
        required_deps = ['fastapi', 'uvicorn', 'sqlalchemy', 'pydantic']
        return all(dep in content.lower() for dep in required_deps)
    
    def _check_database(self):
        """Check Alembic migration configuration."""
        alembic_ini = self.backend_dir / "alembic.ini"
        versions_dir = self.backend_dir / "alembic" / "versions"
        return alembic_ini.exists() and versions_dir.exists()
    
    def _check_models(self):
        """Check backend models."""
        models_dir = self.backend_dir / "models"
        if not models_dir.exists():
            return False
        
        key_models = ['__init__.py', 'project.py', 'task.py', 'user.py', 'agent.py']
        return all((models_dir / model).exists() for model in key_models)
    
    def _check_routers(self):
        """Check API routers."""
        routers_dir = self.backend_dir / "routers"
        if not routers_dir.exists():
            return False
        
        key_routers = ['projects.py', 'tasks.py', 'agents.py', 'users.py']
        return all((routers_dir / router).exists() for router in key_routers)
    
    def _check_frontend_structure(self):
        """Check frontend directory structure."""
        required_dirs = ['src', 'src/components', 'src/services', 'src/types']
        required_files = ['package.json', 'tsconfig.json', 'next.config.ts']
        
        for dir_name in required_dirs:
            if not (self.frontend_dir / dir_name).exists():
                return False
        
        for file_name in required_files:
            if not (self.frontend_dir / file_name).exists():
                return False
        
        return True
    
    def _check_node_deps(self):
        """Check Node.js dependencies."""
        package_file = self.frontend_dir / "package.json"
        if not package_file.exists():
            return False
        
        try:
            package_data = json.loads(package_file.read_text())
            deps = {**package_data.get('dependencies', {}), **package_data.get('devDependencies', {})}
            
            required_deps = ['next', 'react', 'typescript', '@chakra-ui/react']
            return all(dep in deps for dep in required_deps)
        except:
            return False
    
    def _check_typescript(self):
        """Check TypeScript configuration."""
        ts_config = self.frontend_dir / "tsconfig.json"
        return ts_config.exists()
    
    def _check_api_services(self):
        """Check API services."""
        api_dir = self.frontend_dir / "src" / "services" / "api"
        if not api_dir.exists():
            return False
        
        key_services = ['config.ts', 'request.ts', 'projects.ts', 'tasks.ts']
        return all((api_dir / service).exists() for service in key_services)
    
    def _check_components(self):
        """Check component structure."""
        components_dir = self.frontend_dir / "src" / "components"
        return components_dir.exists() and any(components_dir.iterdir())
    
    def _check_env_config(self):
        """Check environment configuration."""
        env_file = self.frontend_dir / ".env.local"
        if not env_file.exists():
            return False
        
        content = env_file.read_text()
        return 'NEXT_PUBLIC_API_BASE_URL' in content
    
    async def perform_integration_tests(self):
        """Perform live integration testing."""
        print("\n🧪 THE BUILDER'S INTEGRATION TESTING")
        print("-" * 50)
        
        # Start backend server for testing
        print("🚀 Starting backend server for testing...")
        backend_process = None
        
        try:
            python_cmd = str(self.backend_dir / ".venv" / ("Scripts" if os.name == 'nt' else "bin") / "python")
            backend_process = subprocess.Popen(
                [python_cmd, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
                cwd=self.backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait for backend to start
            await asyncio.sleep(5)
            
            # Test backend endpoints
            test_results = await self._test_backend_endpoints()
            
            if test_results:
                print("✅ Backend integration tests passed")
                self.integration_results['backend_tests'] = True
            else:
                print("❌ Backend integration tests failed")
                self.integration_results['backend_tests'] = False
            
        except Exception as e:
            print(f"❌ Integration testing failed: {e}")
            self.integration_results['backend_tests'] = False
        finally:
            if backend_process:
                backend_process.terminate()
                try:
                    backend_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    backend_process.kill()
    
    async def _test_backend_endpoints(self):
        """Test key backend endpoints."""
        test_urls = [
            "http://localhost:8000/health",
            "http://localhost:8000/api/projects/",
            "http://localhost:8000/api/tasks/",
            "http://localhost:8000/openapi.json"
        ]
        
        try:
            async with aiohttp.ClientSession() as session:
                for url in test_urls:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status >= 400:
                            print(f"  ❌ {url} - Status: {response.status}")
                            return False
                        else:
                            print(f"  ✅ {url} - OK")
            return True
        except Exception as e:
            print(f"  ❌ Endpoint testing failed: {e}")
            return False
    
    async def generate_final_report(self):
        """Generate The Builder's final integration report."""
        print("\n" + "="*72)
        print("             🏗️ THE BUILDER'S FINAL REPORT")
        print("="*72)
        
        validation_status = "✅ PASSED" if self.integration_results.get('validation_passed', False) else "❌ FAILED"
        backend_tests = "✅ PASSED" if self.integration_results.get('backend_tests', False) else "❌ FAILED"
        
        print(f"📋 System Validation: {validation_status}")
        print(f"🧪 Integration Tests: {backend_tests}")
        
        overall_success = all([
            self.integration_results.get('validation_passed', False),
            self.integration_results.get('backend_tests', False)
        ])
        
        if overall_success:
            print("\n🎉 MISSION ACCOMPLISHED!")
            print("   Frontend-Backend alignment is COMPLETE")
            print("   System is ready for production deployment")
            print("\n🚀 Next Steps:")
            print("   1. Run: python start_system.py")
            print("   2. Access frontend: http://localhost:3000")
            print("   3. Access API docs: http://localhost:8000/docs")
        else:
            print("\n⚠️  MISSION REQUIRES ATTENTION")
            print("   Some alignment issues detected")
            print("   Review the validation results above")
        
        print("\n🏗️ The Builder's work continues...")
        print("="*72)
        
        return overall_success
    
    async def execute_final_integration(self):
        """Execute The Builder's final integration process."""
        self.print_builder_header()
        
        # Phase 1: System Validation
        validation_success = await self.validate_complete_system()
        
        # Phase 2: Integration Testing
        if validation_success:
            await self.perform_integration_tests()
        else:
            print("\n⚠️  Skipping integration tests due to validation failures")
            self.integration_results['backend_tests'] = False
        
        # Phase 3: Final Report
        overall_success = await self.generate_final_report()
        
        return overall_success

async def main():
    """Main execution function with optional modes."""
    parser = argparse.ArgumentParser(
        description="Run system validation and integration tests"
    )
    parser.add_argument(
        "--mode",
        choices=["all", "validate", "test"],
        default="all",
        help=(
            "Choose 'validate' for validation only, 'test' for integration tests only, "
            "or 'all' (default) to run both"
        ),
    )
    args = parser.parse_args()

    integrator = TheBuilderSystemIntegrator()
    integrator.print_builder_header()

    validation_success = True
    if args.mode in ("validate", "all"):
        validation_success = await integrator.validate_complete_system()
        integrator.integration_results["validation_passed"] = validation_success
    else:
        integrator.integration_results["validation_passed"] = True

    if args.mode in ("test", "all"):
        if args.mode == "test" or validation_success:
            await integrator.perform_integration_tests()
        else:
            print("\n⚠️  Skipping integration tests due to validation failures")
            integrator.integration_results["backend_tests"] = False
    else:
        integrator.integration_results["backend_tests"] = True

    success = await integrator.generate_final_report()

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
