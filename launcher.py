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
import platform

class TaskManagerLauncher:
    def __init__(self):
        # Stylized ASCII art banner
        print("\033[96m" + r"""
  _______             _     __  __                                  
 |__   __|           | |   |  \/  |                                 
    | | __ _ _ __ ___| |__ | \  / | __ _ _ __   __ _  __ _  ___ _ __ 
    | |/ _` | '__/ __| '_ \| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
    | | (_| | | | (__| | | | |  | | (_| | | | | (_| | (_| |  __/ |   
    |_|\__,_|_|  \___|_| |_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   
                                                     __/ |          
                                                    |___/           
""" + "\033[0m")
        print("\033[95mWelcome to the Task Manager Launcher!\033[0m\n")
        # Project root is where this script is located
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.processes: List[subprocess.Popen] = []
        
        # Python version check
        py_version = sys.version_info
        print(f"Detected Python version: \033[94m{platform.python_version()}\033[0m\n")
        if py_version.major == 3 and py_version.minor >= 12:
            print("\033[93m[WARNING] Python 3.12+ detected. Some packages (e.g., aiohttp) may not be fully compatible.\033[0m")
            print("If you encounter build errors, consider using Python 3.11 or lower for best compatibility.\n")

        print(f"Project root: \033[92m{self.root_dir}\033[0m")
        print(f"Backend directory: \033[92m{self.backend_dir}\033[0m\n")

        # Check for Windows package managers
        self.is_windows = os.name == 'nt'
        self.has_winget = shutil.which('winget') is not None
        self.has_choco = shutil.which('choco') is not None
        if self.is_windows:
            print(f"winget available: \033[92m{self.has_winget}\033[0m | choco available: \033[92m{self.has_choco}\033[0m\n")

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

    def ensure_windows_dependency(self, dep_name, winget_id=None, choco_id=None, custom_cmd=None):
        """Try to install a dependency using winget or choco if available."""
        if not self.is_windows:
            return False
        print(f"\033[96mChecking for {dep_name}...\033[0m")
        if dep_name.lower() in ["vs_buildtools.exe", "visual c++ build tools", "msvc", "c++ build tools"]:
            # Special handling for Visual C++ Build Tools
            found = shutil.which("cl.exe") is not None
            if found:
                print(f"\033[92mMicrosoft Visual C++ Build Tools are already installed.\033[0m")
                return True
            # Try winget first
            if self.has_winget:
                print(f"\033[93mMicrosoft Visual C++ Build Tools not found. Attempting to install with winget...\033[0m")
                self.run_command(
                    'winget install --id=Microsoft.VisualStudio.2022.BuildTools -e',
                    "Installing Microsoft Visual C++ Build Tools via winget"
                )
                if shutil.which("cl.exe") is not None:
                    print(f"\033[92mMicrosoft Visual C++ Build Tools installed successfully.\033[0m")
                    return True
            # Fallback to choco
            if self.has_choco:
                print(f"\033[93mAttempting to install Microsoft Visual C++ Build Tools with choco...\033[0m")
                self.run_command(
                    'choco install microsoft-visual-cpp-build-tools -y',
                    "Installing Microsoft Visual C++ Build Tools via choco"
                )
                if shutil.which("cl.exe") is not None:
                    print(f"\033[92mMicrosoft Visual C++ Build Tools installed successfully.\033[0m")
                    return True
            print(f"\033[91mFailed to install Microsoft Visual C++ Build Tools. Please install it manually.\033[0m")
            print("To install manually, run (as Administrator):\n")
            print("  winget install --id=Microsoft.VisualStudio.2022.BuildTools -e")
            print("or, if you have Chocolatey:")
            print("  choco install microsoft-visual-cpp-build-tools -y\n")
            print("For more details, see:")
            print("  https://winstall.app/apps/Microsoft.VisualStudio.2022.BuildTools")
            print("  https://community.chocolatey.org/packages/microsoft-visual-cpp-build-tools\n")
            return False
        # Default logic for other dependencies
        if custom_cmd:
            found = shutil.which(dep_name) is not None
            if not found:
                print(f"\033[93m{dep_name} not found. Attempting to install...\033[0m")
                self.run_command(custom_cmd, f"Installing {dep_name}")
                return shutil.which(dep_name) is not None
            return True
        if shutil.which(dep_name):
            print(f"\033[92m{dep_name} is already installed.\033[0m")
            return True
        if self.has_winget and winget_id:
            print(f"\033[93m{dep_name} not found. Attempting to install with winget...\033[0m")
            self.run_command(f'winget install --id {winget_id} -e --accept-package-agreements --accept-source-agreements', f"Installing {dep_name} via winget")
        elif self.has_choco and choco_id:
            print(f"\033[93m{dep_name} not found. Attempting to install with choco...\033[0m")
            self.run_command(f'choco install {choco_id} -y', f"Installing {dep_name} via choco")
        else:
            print(f"\033[91mNo package manager found to install {dep_name}. Please install it manually.\033[0m")
            return False
        # Re-check after install attempt
        if shutil.which(dep_name):
            print(f"\033[92m{dep_name} installed successfully.\033[0m")
            return True
        print(f"\033[91mFailed to install {dep_name}. Please install it manually.\033[0m")
        return False

    def auto_install_system_dependencies(self):
        """Auto-install system dependencies using winget or choco if available."""
        system_deps = [
            # name, winget_id, choco_id
            ("git", "Git.Git", "git"),
            ("psql", "PostgreSQL.PostgreSQL", "postgresql"),
            ("sqlite3", "SQLite.sqlite", "sqlite"),
        ]
        installed = []
        for dep, winget_id, choco_id in system_deps:
            if self.ensure_windows_dependency(dep, winget_id=winget_id, choco_id=choco_id):
                installed.append(dep)
        if installed:
            print(f"\n\033[92mSystem dependencies installed or already present: {', '.join(installed)}\033[0m\n")

    def setup_backend(self):
        """Set up the backend environment."""
        print("\n\033[96mSetting up Backend Environment\033[0m")
        print("\033[90m" + "-" * 40 + "\033[0m")
        venv_path = self.backend_dir / ".venv"
        python_cmd = str(
            venv_path / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        )
        requirements_file = self.backend_dir / "requirements.txt"

        if self.is_windows:
            print("\033[96mChecking for required Windows build tools...\033[0m")
            # Use new logic for Visual C++ Build Tools
            self.ensure_windows_dependency('visual c++ build tools')
            # Then ensure Python and pip
            self.ensure_windows_dependency('python', winget_id='Python.Python.3', choco_id='python')
            self.ensure_windows_dependency('pip', winget_id='Python.Python.3', choco_id='python')
            # Auto-install other system dependencies
            self.auto_install_system_dependencies()

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

        if requirements_file.exists():
            pip_cmd = str(venv_path / ("Scripts/pip.exe" if os.name == 'nt' else "bin/pip"))
            # First upgrade pip
            pip_upgrade_success = self.run_command(
                f'"{pip_cmd}" install --upgrade pip',
                "Upgrading pip",
                cwd=self.backend_dir,
                timeout=60
            )
            if not pip_upgrade_success:
                print("\n[WARNING] pip upgrade failed. This may cause issues with installing some dependencies.")
                print(f"To manually upgrade pip, run:")
                print(f"    {pip_cmd} install --upgrade pip")
                print("If you see permission errors, try running your terminal as Administrator.")
                print("If you are inside a virtual environment, ensure it is activated before running the command.\n")
            print("\033[96mInstalling backend dependencies...\033[0m")
            success = self.run_command(
                f'"{pip_cmd}" install -r requirements.txt --prefer-binary',
                "Installing dependencies (preferred binary)",
                cwd=self.backend_dir,
                timeout=300
            )
            if not success:
                print("   \033[93mStandard installation failed, trying essential packages...\033[0m")
                essential_packages = [
                    "fastapi", "uvicorn[standard]", "sqlalchemy", "alembic",
                    "psycopg2-binary", "python-dotenv", "fastapi-mcp==0.1.3",
                    "passlib==1.7.4", "bcrypt<4", "python-jose", "aiosqlite", 
                    "httpx", "prometheus-client", "websockets==12.0",
                    "email-validator>=2.0.0", "redis",
                    "flake8", "pytest", "pytest-asyncio", "pytest-cov"
                ]
                failed_packages = []
                success_count = 0
                for package in essential_packages:
                    if self.run_command(
                        f'"{pip_cmd}" install {package}',
                        f"Installing {package}",
                        cwd=self.backend_dir,
                        timeout=60
                    ):
                        success_count += 1
                    else:
                        failed_packages.append(package)
                # Try aiohttp separately with binary wheel
                aiohttp_result = self.run_command(
                    f'"{pip_cmd}" install aiohttp==3.9.1 --only-binary=aiohttp',
                    "Installing aiohttp (binary wheel)",
                    cwd=self.backend_dir,
                    timeout=60
                )
                if not aiohttp_result:
                    print("\n\033[93m[WARNING] aiohttp installation failed.\033[0m")
                    print("aiohttp requires Microsoft Visual C++ 14.0 or greater to build from source on Windows.")
                    print("You can download and install the required build tools from:")
                    print("  https://visualstudio.microsoft.com/downloads/?q=build+tools\n")
                    print("After installing, restart your terminal and re-run the launcher, or manually run:")
                    print(f"    {pip_cmd} install aiohttp==3.9.1 --only-binary=aiohttp\n")
                    print("If you do not need aiohttp-based features, you may ignore this warning. Most backend functionality will work without it.")
                    print("For more help, see the official Microsoft documentation:")
                    print("  https://learn.microsoft.com/en-us/answers/questions/419525/microsoft-visual-c-14-0-or-greater-is-required\n")
                    print("\033[90m[Tip] If you see 'Failed building wheel for aiohttp', it's almost always a missing C++ build tools issue.\033[0m\n")
                if failed_packages:
                    print("\n\033[91m[ERROR] The following essential packages failed to install:\033[0m")
                    for pkg in failed_packages:
                        print(f"  - {pkg}")
                    print("\n\033[93mCommon fixes:\033[0m")
                    print("- Ensure you are using a supported Python version (3.7-3.11 recommended)")
                    print("- Upgrade pip to the latest version")
                    print("- Install Microsoft Visual C++ Build Tools for Windows: https://visualstudio.microsoft.com/downloads/?q=build+tools")
                    print("- Check your internet connection and PyPI access\n")
                    print("You can try installing failed packages manually after addressing the above suggestions.\n")
                if success_count < len(essential_packages) // 2:
                    print("\033[91mERROR: Critical dependency installation failed\033[0m")
                    return False
                else:
                    print("\033[93mWarning: Some dependencies may have installation issues\033[0m")
        print("\033[92m* Backend environment ready\033[0m\n")
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

    def start_frontend_server(self):
        """Start the frontend server in a separate terminal window."""
        frontend_dir = Path(__file__).parent / "frontend"
        if not frontend_dir.exists():
            print("ERROR: Frontend directory not found.")
            return None
        print("Starting frontend on http://localhost:3000 (in a new terminal window)")
        try:
            if os.name == "nt":
                # Windows: use 'start' to open a new terminal
                cmd = ["start", "cmd", "/k", "npm run dev"]
                subprocess.Popen(cmd, cwd=frontend_dir, shell=True)
            else:
                # Unix: try x-terminal-emulator, gnome-terminal, or fallback
                terminal_cmds = [
                    ["x-terminal-emulator", "-e", "npm run dev"],
                    ["gnome-terminal", "--", "npm", "run", "dev"],
                    ["konsole", "-e", "npm", "run", "dev"],
                    ["xfce4-terminal", "-e", "npm run dev"],
                    ["xterm", "-e", "npm run dev"]
                ]
                for cmd in terminal_cmds:
                    try:
                        subprocess.Popen(cmd, cwd=frontend_dir)
                        break
                    except FileNotFoundError:
                        continue
                else:
                    print("ERROR: No supported terminal emulator found to launch frontend.")
                    return None
            print("Frontend launch command issued.")
            return True
        except Exception as e:
            print(f"ERROR: Error starting frontend: {e}")
            return None

    def run_backend_only(self, variant: str = "default"):
        """Run the backend server only (no install/setup)."""
        print("\nStarting backend server (no install/setup)...")
        # Assume venv and dependencies are already present
        self.start_backend_server(variant)
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
