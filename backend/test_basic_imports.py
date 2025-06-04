#!/usr/bin/env python3
"""
Simple test script to check if basic imports work.
"""

import sys
import os

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    print("Testing database import...")
    from database import Base
    print("SUCCESS: Database Base imported successfully")
    
    print("Testing basic model imports...")
    from models.base import BaseModel
    print("SUCCESS: BaseModel imported successfully")
    
    print("Testing user model...")
    from models.user import User
    print("SUCCESS: User model imported successfully")
    
    print("Testing enums...")
    from enums import TaskStatusEnum, UserRoleEnum
    print("SUCCESS: Enums imported successfully")
    
    print("\nAll basic imports working!")
    
except Exception as e:
    print(f"FAILED: Import failed: {e}")
    import traceback
    traceback.print_exc()
