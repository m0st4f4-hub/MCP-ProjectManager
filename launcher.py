#!/usr/bin/env python3
"""
Task Manager Development Launcher
Comprehensive launcher for the Task Manager project with backend and frontend support.
"""

import asyncio
import subprocess
import sys
import os
import time
import argparse
import signal
from pathlib import Path
import shutil
import threading
from typing import List, Optional

class TaskManagerLauncher:
    def __init__(self):
        # Project root is where this script is located
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.processes: List[subprocess.Popen] = []
        
        print(f"Project root: {self.root_dir}")
        print(f"Backend directory: {self.backend_dir}")

    def signal_handler(self, signum, frame):
        """Handle interrupt signals gracefully."""
        print("\n\nReceived interrupt signal, cleaning up...")
        self.cleanup()
        sys.exit(0)

    def setup_signal_handlers(self):
        """Set up signal handlers for graceful shutdown."""
        signal.signal(signal.SIGINT, self.signal_handler)
        if hasattr(signal, 'SIGTERM'):
            signal.signal(signal.SIGTERM, self.signal_handler)

    def run_command(self, command: str, description: str, cwd: Optional[Path] = None, timeout: int = 30) -> bool:
        """Run a command with error handling and timeout."""
        try:
            print(f"   {description}...")
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd or self.root_dir,
                timeout=timeout,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return True
            else:
                print(f"   Error: {result.stderr.strip()}")
                return False
        except subprocess.TimeoutExpired:
            print(f"   Error: Command timed out after {timeout} seconds")
            return False
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def clear_port(self, port: int) -> bool:
        """Clear processes running on a specific port."""
        try:
            if os.name == 'nt':  # Windows
                # Find process using the port
                result = subprocess.run(
                    f"netstat -ano | findstr :{port}",
                    shell=True,
                    capture_output=True,
                    text=True
                )
                
                if result.stdout:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        parts = line.split()
                        if len(parts) >= 5 and f":{port}" in parts[1]:
                            pid = parts[-1]
                            try:
                                subprocess.run(f"taskkill /F /PID {pid}", shell=True, check=True)
                                print(f"* Killed process {pid} on port {port}")
                                return True
                            except subprocess.CalledProcessError:
                                print(f"* Killed process {pid} on port {port}")
                                return True
            else:  # Unix-like systems
                result = subprocess.run(
                    f"lsof -ti:{port}",
                    shell=True,
                    capture_output=True,
                    text=True
                )
                
                if result.stdout:
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        if pid:
                            subprocess.run(f"kill -9 {pid}", shell=True)
                            print(f"* Killed process {pid} on port {port}")
                    return True
                    
        except Exception as e:
            print(f"   Error clearing port {port}: {e}")
            
        return False

    def check_directories(self):
        """Check if required directories exist."""
        print("Checking project structure...")
        
        if not self.backend_dir.exists():
            print("ERROR: Backend directory not found!")
            return False
            
        print("* Backend directory verified")
        return True

    def clear_ports(self, ports: List[int]):
        """Clear multiple ports."""
        print(f"Checking and clearing ports: {ports}")
        for port in ports:
            self.clear_port(port)

    def setup_backend(self):
        """Set up the backend environment."""
        print("\nSetting up Backend Environment")
        print("-" * 40)
        
        venv_path = self.backend_dir / ".venv"
        python_cmd = str(
            venv_path / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        )
        
        # Check if virtual environment exists
        if not venv_path.exists():
            print("Creating Python virtual environment...")
            if not self.run_command(
                "python -m venv .venv",
                "Creating virtual environment",
                cwd=self.backend_dir,
                timeout=120
            ):
                return False
        
        # Install core dependencies if needed
        requirements_file = self.backend_dir / "requirements.txt"
        if requirements_file.exists():
            pip_cmd = str(venv_path / ("Scripts/pip.exe" if os.name == 'nt' else "bin/pip"))
            
            # First upgrade pip
            self.run_command(
                f'"{pip_cmd}" install --upgrade pip',
                "Upgrading pip",
                cwd=self.backend_dir,
                timeout=60
            )
            
            # Try to install with pre-compiled wheels first
            print("Installing backend dependencies...")
            success = self.run_command(
                f'"{pip_cmd}" install -r requirements.txt --prefer-binary',
                "Installing dependencies (preferred binary)",
                cwd=self.backend_dir,
                timeout=300
            )
            
            if not success:
                print("   Standard installation failed, trying essential packages...")
                # Fallback: Install essential packages individually  
                essential_packages = [
                    "fastapi", "uvicorn[standard]", "sqlalchemy", "alembic",
                    "psycopg2-binary", "python-dotenv", "fastapi-mcp==0.1.3",
                    "passlib==1.7.4", "bcrypt<4", "python-jose", "aiosqlite", 
                    "httpx", "prometheus-client", "websockets==12.0",
                    "email-validator>=2.0.0", "redis",
                    "flake8", "pytest", "pytest-asyncio", "pytest-cov"
                ]
                
                success_count = 0
                for package in essential_packages:
                    if self.run_command(
                        f'"{pip_cmd}" install {package}',
                        f"Installing {package}",
                        cwd=self.backend_dir,
                        timeout=60
                    ):
                        success_count += 1
                
                # Try aiohttp separately with binary wheel
                if not self.run_command(
                    f'"{pip_cmd}" install aiohttp==3.9.1 --only-binary=aiohttp',
                    "Installing aiohttp (binary wheel)",
                    cwd=self.backend_dir,
                    timeout=60
                ):
                    print("   Warning: aiohttp installation failed (requires Visual C++ Build Tools)")
                    print("   Backend will work for most functionality without aiohttp")
                
                if success_count < len(essential_packages) // 2:
                    print("ERROR: Critical dependency installation failed")
                    return False
                else:
                    print("Warning: Some dependencies may have installation issues")
        
        print("* Backend environment ready")
        return True



    def start_backend_server(self, variant: str = "default"):
        """Start the backend server in the current terminal."""
        print("\n" + "="*60)
        print("    Task Manager Backend Server")
        print("="*60)
        
        # Set up environment
        venv_path = self.backend_dir / ".venv"
        python_cmd = str(
            venv_path / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        )
        
        try:
            # Choose the appropriate startup command based on variant
            if variant == "core":
                cmd = [python_cmd, "-m", "uvicorn", "backend.main_core:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
            elif variant == "minimal":
                cmd = [python_cmd, "-m", "uvicorn", "backend.main_minimal:app", "--host", "0.0.0.0", "--port", "8000"]
            else:  # default
                cmd = [python_cmd, "-m", "uvicorn", "backend.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
            
            # Set environment variables
            env = os.environ.copy()
            env['PYTHONPATH'] = str(self.root_dir)
            
            print("Starting backend on http://localhost:8000")
            print("API Documentation: http://localhost:8000/docs")
            print("Press Ctrl+C to stop\n")
            
            # Start the backend server directly in current terminal
            process = subprocess.Popen(
                cmd,
                cwd=self.root_dir,
                env=env,
                stdout=None,  # Let output go to current terminal
                stderr=None   # Let errors go to current terminal
            )
            
            self.processes.append(process)
            return process
            
        except Exception as e:
            print(f"ERROR: Error starting backend: {e}")
            return None



    def wait_for_servers(self):
        """Wait for the backend server to run."""
        try:
            # Wait for the backend process to complete
            if self.processes:
                backend_process = self.processes[0]
                print("Backend server is running. Press Ctrl+C to stop.\n")
                # Wait for the process to complete (it will run until stopped)
                backend_process.wait()
                print("\nBackend server has stopped.")
        except KeyboardInterrupt:
            print("\nReceived Ctrl+C, shutting down...")
            # Let cleanup handle the rest
        except Exception as e:
            print(f"\nError waiting for backend process: {e}")

    def cleanup(self):
        """Clean up running processes."""
        print("\nStopping backend server...")
        
        # Kill processes on the backend port
        self.clear_ports([8000])
        
        # Clean up backend process
        for process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                try:
                    process.kill()
                except Exception:
                    pass
            except Exception:
                pass
        
        self.processes.clear()
        print("* Backend server stopped")
        print("* Port 8000 cleared")

    def install_dependencies(self):
        """Install backend dependencies."""
        print("=" * 60)
        print("    Task Manager Backend Dependencies")
        print("=" * 60)
        
        if not self.check_directories():
            return False
        
        # Setup backend
        if not self.setup_backend():
            print("ERROR: Backend setup failed")
            return False
        
        print("\n* Backend dependencies installed successfully!")
        return True

    def run_backend_only(self, variant: str = "default"):
        """Run only the backend server."""
        print("=" * 60)
        print("    Task Manager Backend Server")
        print("=" * 60)
        
        if not self.check_directories():
            return False
        
        self.clear_ports([8000])
        
        # Setup backend environment
        if not self.setup_backend():
            return False
        
        # Start backend server
        backend_process = self.start_backend_server(variant)
        if not backend_process:
            return False
        
        # Wait for the server
        self.wait_for_servers()
        
        return True

    def run_backend_server_main(self):
        """Run the backend server."""
        print("=" * 60)
        print("    Task Manager Backend Launcher")
        print("=" * 60)
        
        if not self.check_directories():
            return False
        
        self.clear_ports([8000])
        
        # Setup backend environment
        if not self.setup_backend():
            return False
        
        # Start backend server
        backend_process = self.start_backend_server()
        if not backend_process:
            return False
        
        # Wait for the server
        self.wait_for_servers()
        
        return True


def main():
    parser = argparse.ArgumentParser(
        description="Task Manager Backend Launcher"
    )
    parser.add_argument(
        "--core",
        action="store_true",
        help="Use core backend variant"
    )
    parser.add_argument(
        "--minimal",
        action="store_true",
        help="Use minimal backend variant"
    )
    parser.add_argument(
        "--install",
        action="store_true",
        help="Install dependencies only"
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.core and args.minimal:
        parser.error("--core and --minimal cannot be used together")
    
    launcher = TaskManagerLauncher()
    launcher.setup_signal_handlers()
    
    try:
        if args.install:
            success = launcher.install_dependencies()
        else:
            variant = "core" if args.core else "minimal" if args.minimal else "default"
            success = launcher.run_backend_only(variant)
            
        return 0 if success else 1
        
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        return 1
    finally:
        launcher.cleanup()


if __name__ == "__main__":
    print("\nExamples:")
    print("  python launcher.py                    # Run backend server")
    print("  python launcher.py --core             # Run core backend variant")
    print("  python launcher.py --minimal          # Run minimal backend variant")
    print("  python launcher.py --install          # Install dependencies only")
    print()
    
    sys.exit(main()) 
