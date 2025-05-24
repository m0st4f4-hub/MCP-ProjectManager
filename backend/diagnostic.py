#!/usr/bin/env python3
"""
Simple diagnostic test for the backend testing system.
"""
import os
import sys

# Add the parent directory to the Python path
backend_dir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.dirname(backend_dir)
sys.path.insert(0, parent_dir)

print(f"Backend directory: {backend_dir}")
print(f"Parent directory: {parent_dir}")
print(f"Current working directory: {os.getcwd()}")
print(f"sys.path: {sys.path}")

# Try to import from the backend modules
try:
    import backend
    print(f"\nSuccessfully imported backend module from: {backend.__file__}")
    
    from backend import models
    print(f"Successfully imported models module from: {models.__file__}")
    
    from backend.schemas.project import ProjectCreate
    print("Successfully imported ProjectCreate schema")
    
    from backend.crud import projects
    print("Successfully imported projects CRUD module")
    
    print("\nAll imports successful!")
except ImportError as e:
    print(f"\nImport error: {e}")
    
    print("\nListing parent directory contents:")
    try:
        for item in os.listdir(parent_dir):
            print(f"  {item}")
    except Exception as e:
        print(f"Error listing directory: {e}")
