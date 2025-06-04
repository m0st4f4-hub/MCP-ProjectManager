#!/usr/bin/env python3
"""Test individual router imports to find the problematic one."""

import sys
import os

# Change to backend directory and add to path using the current file location
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

routers_to_test = [
    'routers.memory',
    'routers.rules',
    'routers.tasks.core',
    'routers.tasks.dependencies',
    'routers.tasks.comments',
    'routers.tasks.files',
    'routers.tasks.all_tasks',
    'routers.projects',
    'routers.users',
    'routers.agents',
    'routers.audit_logs',
    'routers.comments',
    'routers.mcp'
]

print("Testing individual router imports...")

for router_module in routers_to_test:
    try:
        print(f"Importing {router_module}...")
        __import__(router_module)
        print(f"OK {router_module} imported successfully")
    except Exception as e:
        print(f"FAIL {router_module} failed: {e}")
        print(f"  Full error: {type(e).__name__}: {e}")

print("Completed router import testing")
