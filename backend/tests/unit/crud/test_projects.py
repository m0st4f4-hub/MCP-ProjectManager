"""
Unit tests for the project CRUD operations.
"""
import pytest
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from backend.crud.projects import (
    get_project,
    get_project_by_name,
    get_projects,
    create_project,
    update_project,
    delete_project
)
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.models import Project


async def test_create_project(async_db_session: AsyncSession):
    """Test creating a project."""
    # Create a project
    project_create = ProjectCreate(
        name="Test Project Create",
        description="A test project for CRUD testing"
    )
    
    # Call the CRUD function
    project = await create_project(async_db_session, project_create)
    
    # Verify the project was created correctly
    assert project.name == project_create.name
    assert project.description == project_create.description
    assert project.task_count == 0
    assert project.is_archived is False


async def test_get_project(async_db_session: AsyncSession, test_project: Project):
    """Test getting a project by ID."""
    # Get the project
    project = await get_project(async_db_session, test_project.id)
    
    # Verify the project was retrieved correctly
    assert project is not None
    assert project.id == test_project.id
    assert project.name == test_project.name
    assert project.description == test_project.description


async def test_get_project_by_name(async_db_session: AsyncSession, test_project: Project):
    """Test getting a project by name."""
    # Get the project
    project = await get_project_by_name(async_db_session, test_project.name)
    
    # Verify the project was retrieved correctly
    assert project is not None
    assert project.id == test_project.id
    assert project.name == test_project.name


async def test_get_projects(async_db_session: AsyncSession, test_project: Project):
    """Test getting all projects."""
    # Create another project
    another_project = Project(
        name="Another Test Project",
        description="Another test project for CRUD testing",
        task_count=0,
        is_archived=False
    )
    async_db_session.add(another_project)
    await async_db_session.commit()
    
    # Get all projects
    projects = await get_projects(async_db_session)
    
    # Verify both projects are returned
    assert len(projects) >= 2
    project_names = [p.name for p in projects]
    assert test_project.name in project_names
    assert another_project.name in project_names


def test_update_project(db_session: Session, test_project: Project):
    """Test updating a project."""
    # Create an update
    project_update = ProjectUpdate(
        name="Updated Test Project",
        description="An updated test project for CRUD testing"
    )
    
    # Update the project
    updated_project = update_project(db_session, test_project.id, project_update)
    
    # Verify the project was updated correctly
    assert updated_project is not None
    assert updated_project.id == test_project.id
    assert updated_project.name == project_update.name
    assert updated_project.description == project_update.description


def test_delete_project(db_session: Session, test_project: Project):
    """Test deleting a project."""
    # Delete the project
    deleted_project = delete_project(db_session, test_project.id)
    
    # Verify the project was returned from delete operation
    assert deleted_project is not None
    assert deleted_project.id == test_project.id
    
    # Verify the project is no longer in the database
    project = get_project(db_session, test_project.id)
    assert project is None
