"""
Production launcher for Task Manager Backend.
"""

import sys
import os
import subprocess
from pathlib import Path

def main():
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    
    if os.name == 'nt':
        python_exe = backend_dir / ".venv" / "Scripts" / "python.exe"
    else:
        python_exe = backend_dir / ".venv" / "bin" / "python"
    
    if not python_exe.exists():
        print("Virtual environment not found. Please run setup first.")
        return False
    
    print("Starting Task Manager Backend - Production Version")
    print(f"Python: {python_exe}")
    
    env = os.environ.copy()
    env['PYTHONPATH'] = str(project_root)
    
    cmd = [
        str(python_exe),
        "-m", "uvicorn",
        "backend.main_production:app",
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
