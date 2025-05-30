#!/usr/bin/env python3
"""
Quick fix for corrupted Python environment - reinstall critical packages
"""

import subprocess
import sys
import os

def run_command(cmd):
    """Run command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(f"CMD: {cmd}")
        print(f"Return code: {result.returncode}")
        if result.stdout:
            print(f"STDOUT: {result.stdout}")
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command {cmd}: {e}")
        return False

def main():
    """Fix the Python environment"""
    
    # Remove corrupted virtual environment
    if os.path.exists(".venv"):
        print("Removing corrupted virtual environment...")
        if not run_command("rmdir /s /q .venv"):
            print("Failed to remove .venv directory")
            return False
    
    # Create fresh virtual environment
    print("Creating fresh virtual environment...")
    if not run_command("python -m venv .venv"):
        print("Failed to create virtual environment")
        return False
    
    # Install pip and setuptools first
    print("Upgrading pip...")
    if not run_command(r".venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel"):
        print("Failed to upgrade pip")
        return False
    
    # Install core dependencies one by one
    core_deps = [
        "fastapi",
        "uvicorn[standard]", 
        "sqlalchemy",
        "pydantic",
        "python-dotenv"
    ]
    
    for dep in core_deps:
        print(f"Installing {dep}...")
        if not run_command(f".venv\\Scripts\\python.exe -m pip install {dep}"):
            print(f"Failed to install {dep}")
            return False
    
    # Test the installation
    print("Testing installation...")
    test_result = run_command(r".venv\Scripts\python.exe -c \"import fastapi, uvicorn, sqlalchemy; print('SUCCESS: Core packages installed')\"")
    
    if test_result:
        print("\n=== ENVIRONMENT RESTORED ===")
        print("You can now run the backend with:")
        print(r".venv\Scripts\python.exe main.py")
        return True
    else:
        print("Environment restoration failed")
        return False

if __name__ == "__main__":
    main()
