#!/usr/bin/env python3
"""
Development Server Startup Script
This script handles the complete setup and startup of the Task Manager backend.
"""

import asyncio
import subprocess
import sys
import os
from pathlib import Path
import time

def run_command(cmd, description, timeout=30):
    """Run a command with description and timeout."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True, 
            timeout=timeout,
            cwd=Path(__file__).parent
        )
        
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            if result.stdout:
                print(f"   Output: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description} failed")
            if result.stderr:
                print(f"   Error: {result.stderr.strip()}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} timed out after {timeout} seconds")
        return False
    except Exception as e:
        print(f"❌ Error during {description}: {e}")
        return False

def check_python_environment():
    """Check if Python environment is properly set up."""
    print("🔍 Checking Python environment...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    print(f"✅ Python {sys.version} detected")
    
    # Check if we're in virtual environment
    venv_path = Path(__file__).parent / ".venv"
    if venv_path.exists():
        print("✅ Virtual environment found")
    else:
        print("⚠️  No virtual environment found - creating one...")
        return setup_virtual_environment()
    
    return True

def setup_virtual_environment():
    """Set up virtual environment and install dependencies."""
    print("🔧 Setting up virtual environment...")
    
    backend_dir = Path(__file__).parent
    
    # Create virtual environment
    if not run_command("python -m venv .venv", "Creating virtual environment", 60):
        return False
    
    # Install dependencies
    pip_path = ".venv\\Scripts\\pip.exe" if os.name == 'nt' else ".venv/bin/pip"
    
    dependencies = [
        "fastapi",
        "uvicorn[standard]", 
        "sqlalchemy",
        "alembic",
        "python-dotenv",
        "passlib[bcrypt]",
        "python-jose",
        "aiosqlite"
    ]
    
    for dep in dependencies:
        if not run_command(f"{pip_path} install {dep}", f"Installing {dep}", 120):
            print(f"⚠️  Failed to install {dep}, continuing...")
    
    return True

def initialize_database():
    """Initialize the database."""
    print("🗄️  Initializing database...")
    
    python_path = ".venv\\Scripts\\python.exe" if os.name == 'nt' else ".venv/bin/python"
    
    if not run_command(f"{python_path} init_db.py", "Database initialization", 60):
        print("⚠️  Database initialization failed, but continuing...")
        return False
    
    return True

def start_development_server():
    """Start the development server."""
    print("🚀 Starting development server...")
    
    python_path = ".venv\\Scripts\\python.exe" if os.name == 'nt' else ".venv/bin/python"
    
    print("🌐 Backend server starting on http://localhost:8000")
    print("📚 API documentation will be available at http://localhost:8000/docs")
    print("🔗 Alternative docs at http://localhost:8000/redoc")
    print("\n⚡ Server is starting... (Press Ctrl+C to stop)")
    
    try:
        # Start server without timeout - let it run
        subprocess.run([
            python_path, "-m", "uvicorn", "main:app", 
            "--reload", "--host", "0.0.0.0", "--port", "8000"
        ], cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

def main():
    """Main setup and startup function."""
    print("🔧 Task Manager Backend Development Setup")
    print("=" * 50)
    
    # Check environment
    if not check_python_environment():
        print("❌ Environment setup failed")
        sys.exit(1)
    
    # Initialize database
    if not initialize_database():
        print("⚠️  Database initialization had issues, but continuing...")
    
    # Start server
    start_development_server()

if __name__ == "__main__":
    main()
