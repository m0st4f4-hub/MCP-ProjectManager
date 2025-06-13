#!/usr/bin/env python3
"""Test individual router imports to find the backend import issues."""

def test_import(module_name):
    try:
        __import__(module_name)
        print(f"✅ {module_name} - OK")
        return True
    except Exception as e:
        print(f"❌ {module_name} - ERROR: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing individual router imports...")
    
    modules_to_test = [
        "routers.auth",
        "routers.users",
        "routers.projects", 
        "routers.tasks",
        "services.user_service",
        "services.audit_log_service",
        "services.agent_service",
        "auth",
        "config"
    ]
    
    for module in modules_to_test:
        test_import(module) 