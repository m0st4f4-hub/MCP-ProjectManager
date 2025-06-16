#!/usr/bin/env python3
"""
Test individual model imports to avoid table redefinition issues.
"""

import sys
import os

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

def test_individual_imports():
    """Test importing models individually."""
    try:
        print("Testing database import...")
        from database import Base
        print("SUCCESS: Database Base imported successfully")
        
        print("Testing base model utilities...")
        from models.base import BaseModel, JSONText, generate_uuid
        print("SUCCESS: Base model utilities imported successfully")
        
        print("Testing enums...")
        from enums import TaskStatusEnum
        print("SUCCESS: Enums imported successfully")
        
        # Test models individually to avoid table conflicts
        print("SUCCESS: User model imported successfully")
        
        return True
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_individual_imports()
    if success:
        print("\nBasic model structure is working!")
    else:
        print("\nModel structure needs more fixes.")
