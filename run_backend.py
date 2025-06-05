"""
Production-ready launcher for the Task Manager Backend.
This script properly handles package imports and runs the full application.
"""

import sys
import os
import subprocess
from pathlib import Path
import argparse


def main():
    parser = argparse.ArgumentParser(
        description="Run the Task Manager Backend"
    )
    parser.add_argument(
        "--core",
        action="store_true",
        help="Run the core backend variant",
    )
    parser.add_argument(
        "--minimal",
        action="store_true",
        help="Run the minimal backend variant",
    )

    args = parser.parse_args()

    if args.core and args.minimal:
        parser.error("--core and --minimal cannot be used together")

    # Get the project root directory
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"

    # Check if virtual environment exists
    if os.name == "nt":
        python_exe = backend_dir / ".venv" / "Scripts" / "python.exe"
    else:
        python_exe = backend_dir / ".venv" / "bin" / "python"

    if not python_exe.exists():
        print("Virtual environment not found. Please run setup first.")
        return False

    module = "backend.main:app"
    if args.core:
        module = "backend.main_core:app"
    elif args.minimal:
        module = "backend.main_minimal:app"

    print(f"Using module {module}")

    print("Starting Task Manager Backend...")
    print(f"Project root: {project_root}")
    print(f"Python: {python_exe}")

    # Set environment variables
    env = os.environ.copy()
    env['PYTHONPATH'] = str(project_root)

    # Run the backend using uvicorn with proper module path
    cmd = [
        str(python_exe),
        "-m",
        "uvicorn",
        module,
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
        "--log-level",
        "info",
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
