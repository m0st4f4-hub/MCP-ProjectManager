"""
Production-ready launcher for the Task Manager Backend.
This script properly handles package imports and runs the full application.
"""

import sys
import os
import subprocess
from pathlib import Path

def main():
    # Get the project root directory
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    
    # Check if virtual environment exists
    if os.name == 'nt':
        python_exe = backend_dir / ".venv" / "Scripts" / "python.exe"
        pip_exe = backend_dir / ".venv" / "Scripts" / "pip.exe"
    else:
        python_exe = backend_dir / ".venv" / "bin" / "python"
        pip_exe = backend_dir / ".venv" / "bin" / "pip"
    
    if not python_exe.exists():
        print("Virtual environment not found. Please run setup first.")
        return False
    
    print("Starting Task Manager Backend...")
    print(f"Project root: {project_root}")
    print(f"Python: {python_exe}")
    
    # Set environment variables
    env = os.environ.copy()
    env['PYTHONPATH'] = str(project_root)
    
    # Run the backend using uvicorn with proper module path
    cmd = [
        str(python_exe),
        "-m", "uvicorn",
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload",
        "--log-level", "info"
    ]
    
    try:
        print("Starting server on http://localhost:8000")
        print("API Documentation: http://localhost:8000/docs")
        print("Alternative docs: http://localhost:8000/redoc")
        print("\nPress Ctrl+C to stop the server\n")
        
        # Run from project root to ensure proper package resolution
        process = subprocess.run(cmd, cwd=project_root, env=env)
        return process.returncode == 0
        
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        return True
    except Exception as e:
        print(f"Error starting server: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
