"""
Unit tests for the project service.
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import datetime
from contextlib import asynccontextmanager

from backend.services.project_service import ProjectService
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.models import Project
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError


async def test_get_project_success(async_db_session: AsyncSession, test_project: Project):
    """Test getting a project successfully."""
    # Create the service
    project_service = ProjectService(async_db_session)
    
    # Mock the crud_projects.get_project function
    with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
        mock_get_project.return_value = test_project
        
        # Get the project using the service and await it
        project = await project_service.get_project(project_id=test_project.id)

        # Verify the project was retrieved correctly
        assert project is not None
        assert project.id == test_project.id
        assert project.name == test_project.name

        # Verify that the mocked CRUD function was called
        # Use positional arguments to match how the function is called
        mock_get_project.assert_called_once_with(async_db_session, test_project.id, False)


async def test_get_project_not_found(async_db_session: AsyncSession):
    """Test getting a non-existent project."""
    # Create the service
    project_service = ProjectService(async_db_session)
    
    # Mock the crud_projects.get_project function to return None
    with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
        mock_get_project.return_value = None
        
        # Attempt to get a non-existent project and await it
        with pytest.raises(EntityNotFoundError) as excinfo:
            await project_service.get_project("non-existent-id")
        
        # Verify the exception message
        assert "Project" in str(excinfo.value)
        assert "non-existent-id" in str(excinfo.value)
        
        # Verify that the mocked CRUD function was called
        mock_get_project.assert_called_once_with(async_db_session, "non-existent-id", False)


async def test_create_project_success(async_db_session: AsyncSession):
    """Test creating a project successfully."""
    # Create the service
    project_service = ProjectService(async_db_session)
    
    # Create a project
    project_create = ProjectCreate(
        name="Test Service Project",
        description="A test project for service testing"
    )
    
    # Create a mock Project for the return value
    mock_project = Project(
        id=str(uuid.uuid4()),
        name=project_create.name,
        description=project_create.description,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        updated_at=datetime.datetime.now(datetime.timezone.utc),
        task_count=0,
        is_archived=False
    )

    # We need to mock multiple functions: create_project and service_transaction
    with patch("backend.services.project_service.create_project", new_callable=AsyncMock) as mock_create_project:
        # Set the mock return value for create_project
        mock_create_project.return_value = mock_project
        
        # We also need to patch service_transaction to avoid SQLAlchemy session issues
        @asynccontextmanager
        async def mock_transaction(*args, **kwargs):
            yield async_db_session
            
        with patch("backend.services.project_service.service_transaction", mock_transaction):
            # Create the project using the service and await it
            project = await project_service.create_project(project_create, created_by_user_id="test-user-id")
            
            # Verify the project was created correctly
            assert project is not None
            assert project.name == project_create.name
            assert project.description == project_create.description
            # Assert that the ID is a valid UUID string
            assert isinstance(project.id, str)
            
            # Verify that the mocked CRUD function was called with positional args
            mock_create_project.assert_called_once_with(async_db_session, project_create, "test-user-id")


async def test_create_project_duplicate(async_db_session: AsyncSession, test_project: Project):
    """Test creating a project with a duplicate name."""
    # Create the service
    project_service = ProjectService(async_db_session)

    # Create a project with the same name
    project_create = ProjectCreate(
        name=test_project.name,
        description="A duplicate project name"
    )

    # Mock the crud_projects.get_project_by_name function to simulate duplicate check finding a project
    with patch("backend.services.project_service.get_project_by_name", new_callable=AsyncMock) as mock_get_project_by_name:
        # Configure the mock to return an existing project, simulating a duplicate
        mock_get_project_by_name.return_value = test_project

        # Attempt to create the project with a duplicate name and await it
        with pytest.raises(DuplicateEntityError) as excinfo:
            await project_service.create_project(project_create)

        # Verify the exception message
        assert "Project" in str(excinfo.value)
        assert test_project.name in str(excinfo.value)

        # Verify that the mocked CRUD get_project_by_name function was called
        mock_get_project_by_name.assert_called_once_with(async_db_session, project_create.name, None)


async def test_update_project_success(async_db_session: AsyncSession, test_project: Project):
    """Test updating a project successfully."""
    # Create the service
    project_service = ProjectService(async_db_session)

    # Create an update
    project_update = ProjectUpdate(
        name="Updated Service Project",
        description="An updated test project for service testing"
    )

    # Mock the crud_projects.update_project function
    with patch("backend.services.project_service.update_project", new_callable=AsyncMock) as mock_update_project:
        # We need to mock both get_project and update_project
        with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
            # Configure the get_project mock to return the test_project (exists check)
            mock_get_project.return_value = test_project
            
            # Configure a real Project object to avoid SQLAlchemy issues
            updated_project = Project(
                id=test_project.id,
                name=project_update.name,
                description=project_update.description,
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc),
                task_count=0,
                is_archived=False
            )
            
            # Set the update_project mock return value
            mock_update_project.return_value = updated_project
            
            # Mock get_project_by_name to return None (no name conflict)
            with patch("backend.services.project_service.get_project_by_name", new_callable=AsyncMock) as mock_get_by_name:
                mock_get_by_name.return_value = None
                
                # Mock the service_transaction context manager
                @asynccontextmanager
                async def mock_transaction(*args, **kwargs):
                    # Create a mock session that handles refresh
                    mock_session = AsyncMock()
                    mock_session.refresh = AsyncMock()  # Mock the refresh method
                    yield mock_session
                
                with patch("backend.services.project_service.service_transaction", mock_transaction):
                    # Update the project using the service and await it
                    updated_result = await project_service.update_project(project_id=test_project.id, project_update=project_update)
                
                    # Verify the project was updated correctly
                    assert updated_result is not None
                    assert updated_result.id == test_project.id
                    assert updated_result.name == project_update.name
                    assert updated_result.description == project_update.description
            
                # Verify that the mocked CRUD function was called with positional args
                mock_update_project.assert_called_once_with(async_db_session, test_project.id, project_update)


async def test_update_project_not_found(async_db_session: AsyncSession):
    """Test updating a non-existent project."""
    # Create the service
    project_service = ProjectService(async_db_session)

    # Create an update
    project_update = ProjectUpdate(
        name="Updated Non-existent Project",
        description="An updated test project for service testing"
    )

    # Mock the crud_projects.update_project function to return None
    with patch("backend.services.project_service.update_project", new_callable=AsyncMock) as mock_update_project:
        mock_update_project.return_value = None

        # Mock the get_project function to return None (simulating project not found)
        with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
            mock_get_project.return_value = None
            
            # Attempt to update a non-existent project and await it
            with pytest.raises(EntityNotFoundError) as excinfo:
                await project_service.update_project(project_id="non-existent-id", project_update=project_update)
                
            # Verify the exception message
            assert "Project" in str(excinfo.value)
            assert "non-existent-id" in str(excinfo.value)
            
            # Verify that the get_project function was called correctly
            mock_get_project.assert_called_once_with(async_db_session, "non-existent-id", None)


async def test_delete_project_success(async_db_session: AsyncSession, test_project: Project):
    """Test deleting a project successfully."""
    # Create the service
    project_service = ProjectService(async_db_session)

    # Mock the crud_projects.delete_project function
    with patch("backend.services.project_service.delete_project", new_callable=AsyncMock) as mock_delete_project:
        # Configure the mock to return the deleted project object
        mock_delete_project.return_value = test_project

        # Delete the project using the service and await it
        deleted_project = await project_service.delete_project(project_id=test_project.id)

        # Verify the project was deleted correctly
        assert deleted_project is not None
        assert deleted_project.id == test_project.id

        # Verify that the mocked CRUD function was called
        mock_delete_project.assert_called_once_with(async_db_session, test_project.id)


async def test_delete_project_not_found(async_db_session: AsyncSession):
    """Test deleting a non-existent project."""
    # Create the service
    project_service = ProjectService(async_db_session)

    # Mock the crud_projects.delete_project function to return None
    with patch("backend.services.project_service.delete_project", new_callable=AsyncMock) as mock_delete_project:
        mock_delete_project.return_value = None

        # Attempt to delete a non-existent project and await it
        with pytest.raises(EntityNotFoundError) as excinfo:
            await project_service.delete_project(project_id="non-existent-id")

        # Verify the exception message
        assert "Project" in str(excinfo.value)
        assert "non-existent-id" in str(excinfo.value)

        # Verify that the mocked CRUD function was called
        # mock_delete_project.assert_called_once_with(
        #     db=async_db_session,
        #     project_id="non-existent-id"
        # )
