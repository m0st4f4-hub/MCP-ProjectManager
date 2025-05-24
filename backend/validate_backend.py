"""
Simple validation test for the refactored backend.
"""

import sys
import os

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)


def test_imports():
    """Test that all imports work correctly."""
    try:
        print("Testing imports...")
        
        # Test database
        from backend.database import Base, engine, SessionLocal
        print("✅ Database imports successful")
        
        # Test models
        from backend.models import User, Project, Task, Agent
        print("✅ Core model imports successful")
        
        # Test configuration
        from backend.config import configure_logging, configure_routers
        print("✅ Configuration imports successful")
        
        # Test MCP tools
        from backend.mcp_tools import create_project_tool, list_projects_tool
        print("✅ MCP tools imports successful")
        
        # Test main app
        from backend.main import app
        print("✅ Main application import successful")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Error during import test: {e}")
        return False


def test_database_creation():
    """Test database table creation."""
    try:
        print("Testing database table creation...")
        
        from backend.database import Base, engine
        from backend import models
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Database creation failed: {e}")
        return False


def main():
    """Run all validation tests."""
    print("🧪 Running backend validation tests...")
    print("=" * 50)
    
    tests = [
        ("Import Tests", test_imports),
        ("Database Tests", test_database_creation),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! Backend is ready to use.")
        print("🚀 Start with: python run_backend.py")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
