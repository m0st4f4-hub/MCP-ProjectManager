
# Test imports
try:
    import backend
    print("Successfully imported backend package")
    
    from backend import models
    print("Successfully imported models module")
    
    from backend.crud import task_dependencies
    print("Successfully imported task_dependencies module")
    
    from backend.crud import project_file_associations
    print("Successfully imported project_file_associations module")
    
    print("All imports successful!")
except Exception as e:
    print(f"Import error: {e}")
