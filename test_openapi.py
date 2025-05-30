#!/usr/bin/env python3
"""
Test script to debug OpenAPI schema generation issues
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    print("Testing import of main FastAPI app...")
    from backend.main import app
    print("✅ Successfully imported main app")
    
    print("\nTesting OpenAPI schema generation...")
    openapi_schema = app.openapi()
    print("✅ Successfully generated OpenAPI schema")
    print(f"Schema has {len(openapi_schema.get('paths', {}))} paths")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
