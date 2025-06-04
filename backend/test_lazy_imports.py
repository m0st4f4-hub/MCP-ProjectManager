#!/usr/bin/env python3
"""
Test the new lazy import model structure.
"""

import sys
import os

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

def test_lazy_imports():
    """Test the new lazy import structure."""
    try:
        print("Testing database import...")
        from database import Base
        print("SUCCESS: Database Base imported")
        
        print("Testing base utilities import...")
        from models.base import BaseModel, JSONText, generate_uuid
        print("SUCCESS: Base utilities imported")
        
        print("Testing enums...")
        from enums import TaskStatusEnum, UserRoleEnum
        print("SUCCESS: Enums imported")
        
        print("Testing lazy model imports...")
        from models import get_user_model, get_memory_models
        User = get_user_model()
        MemoryEntity, MemoryObservation, MemoryRelation = get_memory_models()
        print("SUCCESS: Lazy model imports working")
        
        print(f"User model: {User}")
        print(f"Memory models: {MemoryEntity}, {MemoryObservation}, {MemoryRelation}")
        
        return True
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_lazy_imports()
    if success:
        print("\nLazy import model structure is working!")
    else:
        print("\nModel structure still needs fixes.")
