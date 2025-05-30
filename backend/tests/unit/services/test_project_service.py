"""
Unit tests for the project service.
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock, ANY
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

from .services.project_service import ProjectService
from .schemas.project import ProjectCreate, ProjectUpdate
from .services.exceptions import DuplicateEntityError, EntityNotFoundError
from .services.utils import service_transaction
from .models import Project # For spec=Project

# Import specific CRUD functions (assuming these are correctly named and located)
from backend.crud.projects import (
 get_project as crud_get_project,
 get_project_by_name as crud_get_project_by_name,
 create_project as crud_create_project,
 update_project as crud_update_project,
 delete_project as crud_delete_project,
 get_tasks_by_project as crud_get_tasks_by_project
)
from backend.crud.project_file_associations import (
 associate_file_with_project as crud_associate_file_with_project,
 disassociate_file_from_project as crud_disassociate_file_from_project,
 get_project_files as crud_get_project_files,
 get_project_file_association as crud_get_project_file_association
)
from backend.crud.project_templates import get_project_template as crud_get_project_template
from backend.crud.tasks import create_task as crud_create_task
from backend.crud.project_members import add_project_member as crud_add_project_member

@pytest.fixture
def test_project_data() -> dict:
 return {
 "id": str(uuid.uuid4()),
 "name": "Test Project Fixture",
 "description": "A test project from fixture.",
 "is_template": False,
 "is_archived": False,
 "created_by_user_id": "fixture_user",
 "created_at": datetime.now(timezone.utc),
 "updated_at": datetime.now(timezone.utc),
 "project_members": [],
 "tasks": [],
 "labels": [],
 "versions": [],
 "dependencies": []
 }

@pytest.fixture
def test_project(test_project_data: dict) -> MagicMock:
 mock = MagicMock(spec=Project)
 for key, value in test_project_data.items():
 setattr(mock, key, value)
 return mock


@pytest.mark.asyncio
async def test_get_project_success(async_db_session: AsyncSession, test_project: Project):
 '''Test getting a project successfully.'''
 with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
 project_service = ProjectService(async_db_session)
 mock_get_project.return_value = test_project
 project = await project_service.get_project(project_id=test_project.id)
 assert project is not None
 assert project.id == test_project.id
 mock_get_project.assert_called_once_with(async_db_session, test_project.id, False)

@pytest.mark.asyncio
async def test_get_project_not_found(async_db_session: AsyncSession):
 '''Test getting a non-existent project.'''
 with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
 project_service = ProjectService(async_db_session)
 mock_get_project.return_value = None
 with pytest.raises(EntityNotFoundError):
 await project_service.get_project("non-existent-id")
 mock_get_project.assert_called_once_with(async_db_session, "non-existent-id", False)

def make_mock_async_cm(return_value):
 class MockAsyncCM:
 async def __aenter__(self):
 return return_value
 async def __aexit__(self, exc_type, exc, tb):
 return None
 return MockAsyncCM()

@pytest.mark.asyncio
async def test_create_project_success(async_db_session: AsyncSession):
 '''Test creating a project successfully.'''
 project_service = ProjectService(async_db_session)

 with patch("backend.services.project_service.get_project_by_name", new_callable=AsyncMock) as mock_get_project_by_name:
 with patch("backend.services.project_service.create_project", new_callable=AsyncMock) as mock_create_project:
 with patch("backend.services.project_service.project_template_crud.get_project_template", new_callable=AsyncMock) as mock_get_project_template:
 with patch("backend.services.project_service.service_transaction", return_value=make_mock_async_cm(async_db_session)) as mock_service_transaction:
 # --- Test setup ---
 mock_get_project_by_name.return_value = None # Simulate project name not existing
 
 # Mock for the project that will be "created"
 created_project_db_mock = MagicMock(spec=Project) # Use imported Project
 created_project_db_mock.id = "newly_created_project_uuid"
 created_project_db_mock.name = "Test Project Create"
 created_project_db_mock.description = "Test Description Create"
 created_project_db_mock.is_template = False
 created_project_db_mock.is_archived = False
 created_project_db_mock.created_by_user_id = "user123"
 created_project_db_mock.created_at = datetime.now(timezone.utc)
 created_project_db_mock.updated_at = datetime.now(timezone.utc)
 created_project_db_mock.project_members = []
 created_project_db_mock.tasks = []
 created_project_db_mock.labels = []
 created_project_db_mock.versions = []
 created_project_db_mock.dependencies = []

 mock_create_project.return_value = created_project_db_mock

 # Mock async_db_session.execute to return a mock result with scalar_one_or_none
 mock_result = MagicMock()
 def mock_scalar_one_or_none():
 return created_project_db_mock
 mock_result.scalar_one_or_none = mock_scalar_one_or_none
 async_db_session.execute = AsyncMock(return_value=mock_result)

 project_create_schema = ProjectCreate(
 name="Test Project Create",
 description="Test Description Create"
 # template_id is None by default
 )

 # --- Call the service method ---
 created_project_service_result = await project_service.create_project(
 project_create_schema, created_by_user_id="user123"
 )

 # --- Assertions ---
 mock_get_project_by_name.assert_called_once_with(
 async_db_session, project_create_schema.name, None
 )
 mock_service_transaction.assert_called_once_with(async_db_session, "create_project")
 mock_create_project.assert_called_once_with(
 async_db_session, project_create_schema
 )
 assert created_project_service_result is not None
 assert created_project_service_result.id == "newly_created_project_uuid"
 assert created_project_service_result.name == "Test Project Create"

@pytest.mark.asyncio
async def test_create_project_duplicate(async_db_session: AsyncSession, test_project: Project):
 '''Test creating a project with a duplicate name.'''
 with patch("backend.services.project_service.get_project_by_name", new_callable=AsyncMock) as mock_get_project_by_name:
 project_service = ProjectService(async_db_session)
 mock_get_project_by_name.return_value = test_project # Simulate project already exists
 project_create = ProjectCreate(name=test_project.name)
 with pytest.raises(DuplicateEntityError):
 await project_service.create_project(project_create)
 mock_get_project_by_name.assert_called_once_with(async_db_session, test_project.name, None)

@pytest.mark.asyncio
async def test_update_project_success(async_db_session: AsyncSession, test_project: Project):
 '''Test updating a project successfully.'''
 with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project, \
 patch("backend.services.project_service.update_project", new_callable=AsyncMock) as mock_update_project, \
 patch("backend.services.project_service.service_transaction", return_value=make_mock_async_cm(async_db_session)) as mock_service_transaction_factory, \
 patch.object(async_db_session, "refresh", new_callable=AsyncMock) as mock_refresh:
 project_service = ProjectService(async_db_session)
 mock_get_project.return_value = test_project
 updated_project_data = {"description": "Updated Description"}
 project_update = ProjectUpdate(**updated_project_data)
 # Use a real Project instance for the updated project
 updated_project = Project(
 id=test_project.id,
 name=test_project.name,
 description="Updated Description",
 is_archived=test_project.is_archived,
 created_at=test_project.created_at,
 updated_at=test_project.updated_at
 )
 mock_update_project.return_value = updated_project
 result = await project_service.update_project(test_project.id, project_update)
 mock_get_project.assert_called_once_with(async_db_session, test_project.id, None)
 mock_service_transaction_factory.assert_called_once_with(async_db_session, "update_project")
 mock_update_project.assert_called_once_with(async_db_session, test_project.id, project_update)
 mock_refresh.assert_called_once_with(updated_project)
 assert result.description == "Updated Description"

@pytest.mark.asyncio
async def test_update_project_not_found(async_db_session: AsyncSession):
 '''Test updating a non-existent project.'''
 with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
 project_service = ProjectService(async_db_session)
 mock_get_project.return_value = None # Simulate project not found
 project_update = ProjectUpdate(description="Doesn't matter")
 with pytest.raises(EntityNotFoundError):
 await project_service.update_project("non-existent-id", project_update)
 mock_get_project.assert_called_once_with(async_db_session, "non-existent-id", None)

@pytest.mark.asyncio
async def test_delete_project_success(async_db_session: AsyncSession, test_project: Project):
 '''Test deleting a project successfully.'''
 with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project, \
 patch("backend.services.project_service.delete_project", new_callable=AsyncMock) as mock_delete_project, \
 patch("backend.services.project_service.service_transaction", return_value=make_mock_async_cm(async_db_session)) as mock_service_transaction_factory:
 project_service = ProjectService(async_db_session)
 mock_get_project.return_value = test_project
 await project_service.delete_project(test_project.id)
 mock_get_project.assert_called_once_with(async_db_session, test_project.id, None)
 mock_service_transaction_factory.assert_called_once_with(async_db_session, "delete_project")
 mock_delete_project.assert_called_once_with(async_db_session, test_project.id)

@pytest.mark.asyncio
async def test_delete_project_not_found(async_db_session: AsyncSession):
 '''Test deleting a non-existent project.'''
 with patch("backend.services.project_service.get_project", new_callable=AsyncMock) as mock_get_project:
 project_service = ProjectService(async_db_session)
 mock_get_project.return_value = None # Simulate project not found
 with pytest.raises(EntityNotFoundError):
 await project_service.delete_project("non-existent-id")
 mock_get_project.assert_called_once_with(async_db_session, "non-existent-id", None)

# TODO: Add tests for other ProjectService methods like:
# - get_projects_by_user
# - archive_project
# - unarchive_project
# - add_task_to_project
# - remove_task_from_project
# - get_project_tasks
# - add_member_to_project
# - remove_member_from_project
# - get_project_members
# - associate_file_with_project_service
# - disassociate_file_from_project_service
# - get_project_files_service
