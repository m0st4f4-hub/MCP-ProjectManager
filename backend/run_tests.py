#!/usr/bin/env python3
"""
Script to run all tests for the task manager backend.
"""
import os
import sys
import subprocess
import time
import argparse

def run_tests(test_type=None, verbose=False):
    """Run the tests."""
    os.chdir(os.path.abspath(os.path.dirname(__file__)))
    
    if test_type == "unit":
        cmd = ["pytest", "tests/unit", "-v"] if verbose else ["pytest", "tests/unit"]
    elif test_type == "integration":
        cmd = ["pytest", "tests/integration", "-v"] if verbose else ["pytest", "tests/integration"]
    elif test_type == "all":
        cmd = ["pytest", "tests/unit", "tests/integration", "-v"] if verbose else ["pytest", "tests/unit", "tests/integration"]
    else:
        print("Please specify a test type: unit, integration, or all")
        return
    
    print(f"Running {test_type} tests...")
    start_time = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    end_time = time.time()
    
    print(result.stdout)
    if result.stderr:
        print(f"Errors:\n{result.stderr}")
    
    print(f"Tests completed in {end_time - start_time:.2f} seconds")
    print(f"Exit code: {result.returncode}")
    
    if result.returncode == 0:
        print("All tests passed!")
    else:
        print("Some tests failed.")
    
    return result.returncode

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run task manager backend tests.")
    parser.add_argument("test_type", choices=["unit", "integration", "all"], help="Type of tests to run")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    exit_code = run_tests(args.test_type, args.verbose)
    sys.exit(exit_code)
