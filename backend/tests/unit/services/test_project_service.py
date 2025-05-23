"""
Unit tests for the project service.
"""
import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from backend.services.project_service import ProjectService
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.models import Project
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError


def test_get_project_success(db_session: Session, test_project: Project):
    """Test getting a project successfully."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Get the project
    project = project_service.get_project(test_project.id)
    
    # Verify the project was retrieved correctly
    assert project is not None
    assert project.id == test_project.id
    assert project.name == test_project.name


def test_get_project_not_found(db_session: Session):
    """Test getting a non-existent project."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Attempt to get a non-existent project
    with pytest.raises(EntityNotFoundError) as excinfo:
        project_service.get_project("non-existent-id")
    
    # Verify the exception message
    assert "Project" in str(excinfo.value)
    assert "non-existent-id" in str(excinfo.value)


def test_create_project_success(db_session: Session):
    """Test creating a project successfully."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Create a project
    project_create = ProjectCreate(
        name="Test Service Project",
        description="A test project for service testing"
    )
    
    # Create the project
    project = project_service.create_project(project_create)
    
    # Verify the project was created correctly
    assert project is not None
    assert project.name == project_create.name
    assert project.description == project_create.description


def test_create_project_duplicate(db_session: Session, test_project: Project):
    """Test creating a project with a duplicate name."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Create a project with the same name
    project_create = ProjectCreate(
        name=test_project.name,
        description="A duplicate project name"
    )
    
    # Attempt to create the project with a duplicate name
    with pytest.raises(DuplicateEntityError) as excinfo:
        project_service.create_project(project_create)
    
    # Verify the exception message
    assert "Project" in str(excinfo.value)
    assert test_project.name in str(excinfo.value)


def test_update_project_success(db_session: Session, test_project: Project):
    """Test updating a project successfully."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Create an update
    project_update = ProjectUpdate(
        name="Updated Service Project",
        description="An updated test project for service testing"
    )
    
    # Update the project
    updated_project = project_service.update_project(test_project.id, project_update)
    
    # Verify the project was updated correctly
    assert updated_project is not None
    assert updated_project.id == test_project.id
    assert updated_project.name == project_update.name
    assert updated_project.description == project_update.description


def test_update_project_not_found(db_session: Session):
    """Test updating a non-existent project."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Create an update
    project_update = ProjectUpdate(
        name="Updated Non-existent Project",
        description="An updated test project for service testing"
    )
    
    # Attempt to update a non-existent project
    with pytest.raises(EntityNotFoundError) as excinfo:
        project_service.update_project("non-existent-id", project_update)
    
    # Verify the exception message
    assert "Project" in str(excinfo.value)
    assert "non-existent-id" in str(excinfo.value)


def test_delete_project_success(db_session: Session, test_project: Project):
    """Test deleting a project successfully."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Delete the project
    deleted_project = project_service.delete_project(test_project.id)
    
    # Verify the project was deleted correctly
    assert deleted_project is not None
    assert deleted_project.id == test_project.id
    
    # Verify the project is no longer in the database
    with pytest.raises(EntityNotFoundError):
        project_service.get_project(test_project.id)


def test_delete_project_not_found(db_session: Session):
    """Test deleting a non-existent project."""
    # Create the service
    project_service = ProjectService(db_session)
    
    # Attempt to delete a non-existent project
    with pytest.raises(EntityNotFoundError) as excinfo:
        project_service.delete_project("non-existent-id")
    
    # Verify the exception message
    assert "Project" in str(excinfo.value)
    assert "non-existent-id" in str(excinfo.value)
