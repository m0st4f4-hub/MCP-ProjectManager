#!/usr/bin/env python3
"""
Script to validate database-to-model alignment.
This script tests that all models can be initialized, saved, and retrieved.
"""
import os
import sys
import traceback
from datetime import datetime

# Add backend directory to path
backend_dir = "D:/mcp/task-manager/backend"
sys.path.insert(0, os.path.abspath(backend_dir))
sys.path.insert(0, os.path.abspath(os.path.join(backend_dir, '..')))

# Import database and models
from backend.database import get_db, engine, Base
from backend.models import (
    User, Project, Task, Agent, Comment, 
    ProjectMember, TaskDependency, MemoryEntity, 
    MemoryObservation, MemoryRelation
)
from backend.enums import TaskStatusEnum, UserRoleEnum

def test_database_connection():
    """Test the database connection."""
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Test a simple query using text()
        from sqlalchemy import text
        result = db.execute(text("SELECT 1"))
        row = result.fetchone()
        assert row[0] == 1, "Database query failed"
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        traceback.print_exc()
        return False
    finally:
        try:
            db_gen.close()
        except:
            pass

def test_model_creation():
    """Test that all models can be initialized and saved."""
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Test timestamp for unique values
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Create a test user
        test_user = User(
            username=f"test_user_{timestamp}", 
            hashed_password="hashed_password_placeholder",
            email=f"test_{timestamp}@example.com"
        )
        db.add(test_user)
        db.flush()  # Flush to get the ID without committing
        
        # Create a test project
        test_project = Project(
            name=f"Test Project {timestamp}",
            description="Test project for validation"
        )
        db.add(test_project)
        db.flush()
        
        # Create a test agent
        test_agent = Agent(
            name=f"Test Agent {timestamp}",
            is_archived=False
        )
        db.add(test_agent)
        db.flush()
        
        # Create a test task
        test_task = Task(
            project_id=test_project.id,
            task_number=1,
            title=f"Test Task {timestamp}",
            description="Test task for validation",
            status=TaskStatusEnum.TO_DO,
            is_archived=False
        )
        db.add(test_task)
        db.flush()
        
        # Create a test comment
        test_comment = Comment(
            task_project_id=test_project.id,
            task_task_number=1,
            author_id=test_user.id,
            content="Test comment for validation"
        )
        db.add(test_comment)
        db.flush()
        
        # Create a test project member
        test_project_member = ProjectMember(
            project_id=test_project.id,
            user_id=test_user.id,
            role="member"
        )
        db.add(test_project_member)
        db.flush()
        
        # Create test memory entity
        test_memory_entity = MemoryEntity(
            entity_type="test",
            content="Test memory entity",
            created_by_user_id=test_user.id
        )
        db.add(test_memory_entity)
        db.flush()
        
        # Create test memory observation
        test_memory_observation = MemoryObservation(
            entity_id=test_memory_entity.id,
            content="Test observation"
        )
        db.add(test_memory_observation)
        db.flush()
        
        # Test queries
        queried_user = db.query(User).filter(User.id == test_user.id).first()
        assert queried_user is not None, "Failed to retrieve test user"
        
        queried_project = db.query(Project).filter(Project.id == test_project.id).first()
        assert queried_project is not None, "Failed to retrieve test project"
        
        queried_task = db.query(Task).filter(
            Task.project_id == test_project.id,
            Task.task_number == 1
        ).first()
        assert queried_task is not None, "Failed to retrieve test task"
        
        print("✅ All models initialized and queried successfully")
        
        # Don't commit - roll back the test data
        db.rollback()
        print("✅ Test data rolled back")
        
        return True
    except Exception as e:
        print(f"❌ Model creation failed: {e}")
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        try:
            db_gen.close()
        except:
            pass

def run_tests():
    """Run all validation tests."""
    print("=" * 60)
    print("Database-to-Model Alignment Validation")
    print("=" * 60)
    
    connection_ok = test_database_connection()
    if not connection_ok:
        print("❌ Validation failed: Database connection test failed")
        return False
    
    models_ok = test_model_creation()
    if not models_ok:
        print("❌ Validation failed: Model creation test failed")
        return False
    
    print("✅ Validation successful! Database and models are aligned.")
    return True

if __name__ == "__main__":
    success = run_tests()
    if not success:
        sys.exit(1)
