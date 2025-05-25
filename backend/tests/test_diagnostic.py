"""
Script to run a single test and diagnose issues.
"""
import os
import sys
import time
import pytest
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import after path is set
from backend.schemas.project import ProjectCreate
from backend.crud import projects as crud_projects

async def test_project_creation(async_db_session: AsyncSession):
    """Test creating a project."""
    project_schema = ProjectCreate(
        name="Test Diagnostic Project", description="Created for diagnostics")
    
    print("\nAttempting to create project...")
    db_project = await crud_projects.create_project(db=async_db_session, project=project_schema)
    
    assert db_project is not None, "Project creation failed - project is None"
    assert db_project.name == project_schema.name, f"Name mismatch: {db_project.name} != {project_schema.name}"
    assert db_project.description == project_schema.description, "Description mismatch"
    assert db_project.id is not None, "Project ID is None"
    
    print(f"Project created successfully with ID: {db_project.id}")
    
    print("\nAttempting to retrieve project...")
    retrieved_project = await crud_projects.get_project(
        db=async_db_session, project_id=db_project.id)
    
    assert retrieved_project is not None, "Project retrieval failed - project is None"
    assert retrieved_project.id == db_project.id, "ID mismatch"
    assert retrieved_project.name == project_schema.name, "Name mismatch"
    
    print("Project retrieved successfully")
    return True

if __name__ == "__main__":
    # Run the test using pytest
    print("Running project creation test...")
    exit_code = pytest.main(["-xvs", __file__])
    print(f"Test completed with exit code: {exit_code}")
