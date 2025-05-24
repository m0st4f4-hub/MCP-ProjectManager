#!/usr/bin/env python3
"""
Script to run tests with proper Python path setup.
"""
import os
import sys
import subprocess
import time

def setup_env():
    """Setup the environment for testing."""
    # Make sure we're in the backend directory
    backend_dir = os.path.abspath(os.path.dirname(__file__))
    parent_dir = os.path.dirname(backend_dir)  # Parent directory of backend
    os.chdir(backend_dir)
    
    # Add the parent directory to PYTHONPATH so 'backend' can be found
    os.environ['PYTHONPATH'] = parent_dir
    
    # Also modify sys.path
    sys.path.insert(0, parent_dir)


def run_test(test_path):
    """Run a specific test with the correct Python path."""
    setup_env()
    
    # Construct the pytest command
    pytest_cmd = [sys.executable, "-m", "pytest", test_path, "-v"]
    
    print(f"Running: {' '.join(pytest_cmd)}")
    print(f"Working directory: {os.getcwd()}")
    print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', '')}")
    
    # Run pytest
    start_time = time.time()
    process = subprocess.run(pytest_cmd, capture_output=True, text=True)
    end_time = time.time()
    
    # Print output
    print("\nStandard Output:")
    print(process.stdout)
    
    if process.stderr:
        print("\nStandard Error:")
        print(process.stderr)
    
    print(f"\nTest completed in {end_time - start_time:.2f} seconds with exit code {process.returncode}")
    return process.returncode

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_test.py <test_path>")
        print("Example: python run_test.py tests/test_projects_crud.py::test_create_and_get_project")
        sys.exit(1)
    
    test_path = sys.argv[1]
    exit_code = run_test(test_path)
    sys.exit(exit_code)
