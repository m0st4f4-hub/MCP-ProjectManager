#!/usr/bin/env python3
"""
Task Manager Full System Integration Script
This script coordinates the complete setup and startup of both backend and frontend.
"""

import asyncio
import subprocess
import sys
import os
import time
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import threading

class SystemIntegrator:
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.processes = []
        
    def print_header(self):
        """Print system header."""
        print("[Build] Task Manager System Integration")
        print("=" * 60)
        print("[Target] Initializing complete development environment...")
        print()
    
    def check_directories(self):
        """Check if required directories exist."""
        print("[Dir] Checking project structure...")
        
        if not self.backend_dir.exists():
            print("[Error] Backend directory not found")
            return False
            
        if not self.frontend_dir.exists():
            print("[Error] Frontend directory not found")
            return False
            
        print("[Success] Project structure verified")
        return True
    
    def run_command(self, cmd, description, cwd=None, timeout=60):
        """Run a command with proper error handling."""
        print(f"[Tool] {description}...")
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=cwd or self.root_dir
            )
            
            if result.returncode == 0:
                print(f"[Success] {description} completed")
                return True
            else:
                print(f"[Error] {description} failed")
                if result.stderr:
                    print(f"   Error: {result.stderr.strip()}")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {description} timed out")
            return False
        except Exception as e:
            print(f"[Error] Error in {description}: {e}")
            return False
    
    def setup_backend(self):
        """Set up the backend environment."""
        print("\n[Backend] Setting up Backend Environment")
        print("-" * 40)
        
        # Check if virtual environment exists
        venv_path = self.backend_dir / ".venv"
        if not venv_path.exists():
            print("[Info] Creating Python virtual environment...")
            if not self.run_command(
                "python -m venv .venv",
                "Creating virtual environment",
                cwd=self.backend_dir,
                timeout=120
            ):
                return False
        
        # Install core dependencies
        pip_cmd = ".venv\\Scripts\\pip.exe" if os.name == 'nt' else ".venv/bin/pip"
        core_deps = ["fastapi", "uvicorn[standard]", "sqlalchemy", "python-dotenv", "aiosqlite"]
        
        for dep in core_deps:
            if not self.run_command(
                f"{pip_cmd} install {dep}",
                f"Installing {dep}",
                cwd=self.backend_dir,
                timeout=120
            ):
                print(f"[Warning] Failed to install {dep}, continuing...")
        
        print("[Success] Backend environment setup completed")
        return True
    
    def setup_frontend(self):
        """Set up the frontend environment."""
        print("\n[Frontend] Setting up Frontend Environment")
        print("-" * 40)
        
        # Check if node_modules exists
        node_modules = self.frontend_dir / "node_modules"
        if not node_modules.exists():
            print("[Info] Installing Node.js dependencies...")
            if not self.run_command(
                "npm install",
                "Installing npm dependencies",
                cwd=self.frontend_dir,
                timeout=300
            ):
                print("[Warning] npm install failed, but continuing...")
        
        print("[Success] Frontend environment setup completed") 
        return True
    
    def initialize_database(self):
        """Initialize the database."""
        print("\n[Database] Initializing Database")
        print("-" * 40)
        
        python_cmd = ".venv\\Scripts\\python.exe" if os.name == 'nt' else ".venv/bin/python"
        
        # Check if database exists
        db_path = self.backend_dir / "sql_app.db"
        if db_path.exists():
            print("[Success] Database already exists")
            return True
        
        # Run database initialization
        init_script = self.backend_dir / "init_db.py"
        if init_script.exists():
            return self.run_command(
                f"{python_cmd} init_db.py",
                "Initializing database",
                cwd=self.backend_dir,
                timeout=60
            )
        else:
            print("[Warning] Database initialization script not found")
            return True
    
    def start_backend_server(self):
        """Start the backend server in a separate process."""
        print("[Start] Starting Backend Server...")
        
        python_cmd = str(self.backend_dir / ".venv" / "Scripts" / "python.exe") if os.name == 'nt' else str(self.backend_dir / ".venv" / "bin" / "python")
        
        try:
            process = subprocess.Popen(
                [python_cmd, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
                cwd=self.backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.processes.append(("Backend", process))
            print("[Success] Backend server starting on http://localhost:8000")
            return True
            
        except Exception as e:
            print(f"[Error] Failed to start backend server: {e}")
            return False
    
    def start_frontend_server(self):
        """Start the frontend server in a separate process."""
        print("[Start] Starting Frontend Server...")
        
        try:
            process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=self.frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=True
            )
            
            self.processes.append(("Frontend", process))
            print("[Success] Frontend server starting on http://localhost:3000")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start frontend server: {e}")
            return False
    
    def wait_for_servers(self):
        """Wait for servers to start and monitor them."""
        print("\n[Wait] Waiting for servers to start...")
        time.sleep(5)
        
        print("\n[Network] System Status:")
        print("   Backend:  http://localhost:8000")
        print("   Frontend: http://localhost:3000")
        print("   API Docs: http://localhost:8000/docs")
        print("\n[Success] System is ready for development!")
        print("\n[Stop] Press Ctrl+C to stop all servers")
        
        try:
            # Keep the script running and monitor processes
            while True:
                time.sleep(1)
                
                # Check if any process has died
                for name, process in self.processes:
                    if process.poll() is not None:
                        print(f"[Warning] {name} server stopped unexpectedly")
                        return False
                        
        except KeyboardInterrupt:
            print("\n[Stop] Shutting down system...")
            return True
    
    def cleanup(self):
        """Clean up all running processes."""
        print("[Cleanup] Cleaning up processes...")
        
        for name, process in self.processes:
            if process.poll() is None:
                print(f"   Stopping {name} server...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        
        print("[Success] Cleanup completed")
    
    async def run_system_integration(self):
        """Run the complete system integration."""
        try:
            self.print_header()
            
            # Check project structure
            if not self.check_directories():
                return False
            
            # Setup environments
            if not self.setup_backend():
                return False
                
            if not self.setup_frontend():
                return False
            
            # Initialize database
            if not self.initialize_database():
                print("[Warning] Database initialization had issues")
            
            # Start servers
            if not self.start_backend_server():
                return False
                
            if not self.start_frontend_server():
                return False
            
            # Wait and monitor
            return self.wait_for_servers()
            
        except Exception as e:
            print(f"[Error] System integration failed: {e}")
            return False
        finally:
            self.cleanup()

async def main():
    """Main function."""
    integrator = SystemIntegrator()
    success = await integrator.run_system_integration()
    
    if success:
        print("[Success] System integration completed successfully!")
    else:
        print("[Error] System integration failed")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
