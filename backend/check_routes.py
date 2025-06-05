#!/usr/bin/env python3
"""Test script to check what endpoints are registered"""

import sys
import os
sys.path.insert(0, os.path.abspath('.'))

try:
    from backend.main import app
    print("App imported successfully")

    # Print all routes
    print("\nRegistered routes:")
    for route in app.routes:
        if hasattr(route, 'path'):
            methods = getattr(route, 'methods', ['GET'])
            print(f"{methods} {route.path}")

    print("\nDone")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
