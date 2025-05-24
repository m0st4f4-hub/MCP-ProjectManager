#!/usr/bin/env python3
"""
Script to run the Task Manager backend server.
This script activates the virtual environment and runs the FastAPI server.
"""
import os
import sys
import subprocess

def run_backend():
    """Run the backend server."""
    # Define paths
    backend_dir = os.path.abspath(os.path.dirname(__file__))
    venv_dir = os.path.join(backend_dir, ".venv")
    venv_python = os.path.join(venv_dir, "Scripts", "python") if sys.platform == "win32" else os.path.join(venv_dir, "bin", "python")
    
    # Check if venv exists
    if not os.path.exists(venv_python):
        print(f"Virtual environment not found at {venv_dir}")
        print("Please create the virtual environment first:")
        print(f"  cd {backend_dir}")
        print("  python -m venv .venv")
        print("  .venv\\Scripts\\activate  # Windows")
        print("  source .venv/bin/activate  # Linux/macOS")
        print("  pip install -r requirements.txt")
        return False
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Run the server
    print(f"Starting backend server from {backend_dir}")
    try:
        result = subprocess.run([venv_python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])
        return result.returncode == 0
    except Exception as e:
        print(f"Error starting server: {e}")
        return False

if __name__ == "__main__":
    success = run_backend()
    sys.exit(0 if success else 1)
