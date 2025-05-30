"""
Unit tests for the project routes.
"""
import pytest
import pytest_asyncio
# from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, AsyncMock
import json
from fastapi import Depends, FastAPI # Import FastAPI
from fastapi.security import OAuth2PasswordBearer
from backend.main import app # Assuming your FastAPI app is in main.py
from datetime import datetime # Ensure datetime is imported

# Import timezone from datetime
from datetime import timezone

# Import backend to resolve NameError
import backend

# Import necessary schemas, models, and services
from .schemas.project import Project, ProjectCreate, ProjectUpdate
from .schemas.user import User, UserRole # Assuming User and UserRole models exist
from .models.project import Project as ProjectModel # Import SQLAlchemy model for type hinting mock returns
from .models.user import User as UserModel # Import SQLAlchemy model for type hinting
from .models.audit import AuditLog as AuditLogModel # Import AuditLogModel
from .services import project_service

# Import authentication dependencies and utilities
from .auth import get_current_active_user, RoleChecker
from .enums import UserRoleEnum # Assuming UserRoleEnum is defined here or imported

# Import necessary libraries for async testing
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession for mocking
import uuid # Import uuid for generating IDs

# Import get_db dependency
from .database import get_db # Import the actual get_db

# Import EntityNotFoundError, DuplicateEntityError, and ValidationError
from .services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError

# Define MockRoleChecker at the module level
class MockRoleChecker:
 def __init__(self, allowed_roles): # Keep the constructor signature
 # The __init__ method still receives the arguments passed in Depends(RoleChecker(...))
 self.allowed_roles = allowed_roles

 async def __call__(self, current_user: User = Depends(get_current_active_user)):
 # This method is called when the dependency is resolved during a request.
 # Since get_current_active_user is already overridden to return the mock admin,
 # we can simply return the user, effectively passing the role check.
 # print(f"[AUTH DEBUG] MockRoleChecker __call__ for user: {current_user.username}. Allowing access.") # Comment out debug print
 return current_user # Return the user to satisfy the dependency


# Mock dependency for get_db
@pytest_asyncio.fixture
async def mock_db_session():
 # Create a mock database session. This is a simplification;
 # for more complex scenarios, you might need a more sophisticated mock or an in-memory DB.
 mock_session = MagicMock(spec=AsyncSession) # Mock AsyncSession
 # Configure the mock session methods if needed by the tests
 yield mock_session


# Fixture to override dependencies for API tests
@pytest_asyncio.fixture
async def test_client_with_mocks(mock_db_session, test_user, mock_project_service_instance, mock_audit_log_service_instance):
 """Create an asynchronous test client with mocked dependencies."""
 # Import the projects router
 from backend.routers import projects as projects_router

 # Override get_db to return the mock session using an async generator
 async def override_get_db():
 yield mock_db_session

 app.dependency_overrides[get_db] = override_get_db # Override get_db dependency with the async generator

 # Override authentication dependencies
 async def override_get_current_active_user():
 return test_user # Return the test_user fixture

 app.dependency_overrides[get_current_active_user] = override_get_current_active_user

 # Override RoleChecker dependency
 app.dependency_overrides[RoleChecker] = MockRoleChecker

 # Include the projects router
 app.include_router(projects_router.router, prefix="/api/v1", tags=["Projects"])

 # Use ASGITransport for async testing
 async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as async_client:
 yield async_client

 # Clean up dependency overrides after the test
 app.dependency_overrides.clear()

# Fixture to create a test user
@pytest_asyncio.fixture
async def test_user():
 user_id = str(uuid.uuid4())
 user = User(
 id=user_id,
 username="testuser",
 hashed_password="fakehashedpassword",
 email="testuser@example.com",
 full_name="Test User",
 disabled=False,
 user_roles=[UserRole(role_name=UserRoleEnum.ADMIN, user_id=user_id)]
 )
 return user


# Fixture for the ProjectService with mocked dependencies
@pytest.fixture
def mock_project_service_instance():
 """Provides an AsyncMock instance for ProjectService."""
 return AsyncMock(spec=project_service.ProjectService)


# Fixture for the AuditLogService with mocked dependencies
@pytest.fixture
def mock_audit_log_service_instance():
 """Provides an AsyncMock instance for AuditLogService."""
 from .services.audit_log_service import AuditLogService # Correct import
 return AsyncMock(spec=AuditLogService)


# Fixture to override the get_project_service dependency in routers
@pytest_asyncio.fixture
async def project_service_override(mock_project_service_instance):
 # Override the get_project_service dependency to return our mock instance
 # Ensure backend.routers.projects is accessible
 from backend.routers import projects as project_router_module # Explicit import
 original_get_project_service = app.dependency_overrides.get(project_router_module.get_project_service)
 app.dependency_overrides[project_router_module.get_project_service] = lambda: mock_project_service_instance
 yield mock_project_service_instance
 # Clean up the override after the test - rely on test_client_with_mocks clear() for general cleanup
 # More specific cleanup if needed, but be careful of interaction with other fixtures clearing overrides.
 if project_router_module.get_project_service in app.dependency_overrides: # Check if key exists
 if original_get_project_service:
 app.dependency_overrides[project_router_module.get_project_service] = original_get_project_service
 else:
 # If original was None (i.e., not overridden before), simply delete the current override
 del app.dependency_overrides[project_router_module.get_project_service]


# Fixture to override the get_audit_log_service dependency in routers
@pytest_asyncio.fixture
async def audit_log_service_override(mock_audit_log_service_instance):
 # Override the get_audit_log_service dependency to return our mock instance
 from backend.routers import projects as project_router_module # Explicit import
 original_get_audit_log_service = app.dependency_overrides.get(project_router_module.get_audit_log_service)
 app.dependency_overrides[project_router_module.get_audit_log_service] = lambda: mock_audit_log_service_instance
 yield mock_audit_log_service_instance
 # Clean up the override after the test
 if project_router_module.get_audit_log_service in app.dependency_overrides:
 if original_get_audit_log_service:
 app.dependency_overrides[project_router_module.get_audit_log_service] = original_get_audit_log_service
 else:
 del app.dependency_overrides[project_router_module.get_audit_log_service]


# Apply the service override fixture to all tests in this module
pytestmark = pytest.mark.usefixtures("project_service_override", "audit_log_service_override", "test_client_with_mocks")


@pytest.fixture
def mock_current_user():
 """Mock the current user authentication dependency."""
 with patch("backend.routers.projects.get_current_active_user") as mock:
 user = MagicMock(spec=User)
 user.id = "test-user-id"
 user.username = "testuser"
 mock.return_value = user
 yield mock


# --- Project Member CRUD Tests ---

async def test_create_project_success(
 mock_project_service_instance, # Use the injected service instance mock directly
 mock_audit_log_service_instance, # Use the injected audit service instance mock directly
 mock_current_user, 
 test_client_with_mocks,
 test_user # Add test_user fixture here
):
 """Test creating a project successfully."""
 # Create a mock ProjectModel object to be returned by the service
 mock_project_return_object = MagicMock(spec=ProjectModel)
 mock_project_return_object.id = "test-project-id"
 mock_project_return_object.name = "Test Project"
 mock_project_return_object.description = "A test project"
 mock_project_return_object.task_count = 0
 mock_project_return_object.is_archived = False
 # Set created_at and updated_at as datetime objects or mocks if needed for validation
 mock_project_return_object.created_at = datetime.now(timezone.utc)
 mock_project_return_object.updated_at = datetime.now(timezone.utc)
 mock_project_return_object.created_by_user_id = test_user.id # Use the actual test user ID
 mock_project_return_object.template_id = None
 mock_project_return_object.last_activity_at = datetime.now(timezone.utc)
 mock_project_return_object.tasks = [] # Assuming this is needed for Project schema validation
 mock_project_return_object.members = [] # Assuming this is needed for Project schema validation

 # Configure the create_project method return value
 mock_project_service_instance.create_project.return_value = mock_project_return_object

 # Configure mock_current_user
 mock_current_user_instance = MagicMock(spec=UserModel)
 mock_current_user_instance.id = test_user.id # Use the actual test user ID
 mock_current_user.return_value = mock_current_user_instance

 # Configure the create_log method return value
 mock_audit_log_service_instance.create_log.return_value = MagicMock(spec=AuditLogModel)

 # Create a request body
 request_body = {
 "name": "Test Project",
 "description": "A test project"
 }

 # Make the request
 response = await test_client_with_mocks.post(
 "/api/v1/projects/",
 json=request_body,
 headers={"Authorization": "Bearer test-token"}
 )

 # Verify the response
 assert response.status_code == 200
 response_data = response.json()
 assert response_data["success"] is True
 assert "message" in response_data
 assert response_data["data"]["name"] == "Test Project"
 assert response_data["data"]["description"] == "A test project"

 # Verify the service was called correctly
 mock_project_service_instance.create_project.assert_called_once()
 # Call args are (self, project, created_by_user_id) for the actual method
 # For an AsyncMock, call_args is a Call object. args is a tuple, kwargs is a dict.
 # Since create_project is called with keyword args in router, check kwargs.
 call_kwargs_project_service = mock_project_service_instance.create_project.call_args.kwargs
 assert call_kwargs_project_service["project"].name == "Test Project"
 assert call_kwargs_project_service["project"].description == "A test project"
 assert call_kwargs_project_service["created_by_user_id"] == test_user.id # Assert against the actual user ID

 # Verify the audit log service was called with correct details
 mock_audit_log_service_instance.create_log.assert_called_once()
 audit_call_kwargs = mock_audit_log_service_instance.create_log.call_args.kwargs
 assert audit_call_kwargs["action"] == "create_project"
 assert audit_call_kwargs["user_id"] == test_user.id # Use the actual test user ID
 assert audit_call_kwargs["details"] == {"project_id": "test-project-id", "project_name": "Test Project"}


async def test_create_project_duplicate(mock_project_service_instance, mock_current_user, test_client_with_mocks):
 """Test creating a project with a duplicate name."""
 # Configure the create_project method to raise an exception
 mock_project_service_instance.create_project.side_effect = DuplicateEntityError("Project", "Test Project")

 # Create a request body
 request_body = {
 "name": "Test Project",
 "description": "A test project"
 }

 # Use the client from the fixture
 response = await test_client_with_mocks.post(
 "/api/v1/projects/",
 json=request_body,
 headers={"Authorization": "Bearer test-token"} # Assuming auth is handled by fixture
 )

 # Verify the response
 assert response.status_code == 409
 response_data = response.json()
 # Check for the standardized error response structure
 assert "message" in response_data 
 assert "success" in response_data and response_data["success"] is False
 assert "error_code" in response_data and response_data["error_code"] == "HTTP409"
 assert "Test Project" in response_data["message"] # Check if the project name is in the message


async def test_get_project_success(mock_project_service_instance, test_client_with_mocks):
 """Test getting a project successfully."""
 # Mock the project service to return a project
 project = MagicMock(spec=Project)
 project.id = "test-project-id"
 project.name = "Test Project"
 project.description = "A test project"
 project.task_count = 0
 project.is_archived = False
 mock_project_service_instance.get_project.return_value = project

 # Make the request
 response = await test_client_with_mocks.get("/api/v1/projects/test-project-id")

 # Verify the response
 assert response.status_code == 200
 response_data = response.json()
 assert response_data["success"] is True
 assert "message" in response_data
 assert response_data["data"]["id"] == "test-project-id"
 assert response_data["data"]["name"] == "Test Project"

 # Verify the service was called correctly
 mock_project_service_instance.get_project.assert_called_once_with(
 project_id="test-project-id", is_archived=False
 )


async def test_get_project_not_found(mock_project_service_instance, test_client_with_mocks):
 """Test getting a non-existent project."""
 # Mock the project service to raise an EntityNotFoundError
 mock_project_service_instance.get_project.side_effect = EntityNotFoundError("Project", "test-project-id")

 # Make the request
 response = await test_client_with_mocks.get("/api/v1/projects/test-project-id")

 # Verify the response
 assert response.status_code == 404
 response_data = response.json()
 # Check for the standardized error response structure
 assert "message" in response_data
 assert "success" in response_data and response_data["success"] is False
 assert "error_code" in response_data and response_data["error_code"] == "HTTP404"
 assert "Project not found" in response_data["message"] # Check for the correct message


async def test_get_projects_success(mock_project_service_instance, test_client_with_mocks):
 """Test getting all projects successfully."""
 # Mock the project service to return a list of projects
 project1 = MagicMock(spec=Project)
 project1.id = "test-project-id-1"
 project1.name = "Test Project 1"
 project1.description = "A test project 1"
 project1.task_count = 0
 project1.is_archived = False
 
 project2 = MagicMock(spec=Project)
 project2.id = "test-project-id-2"
 project2.name = "Test Project 2"
 project2.description = "A test project 2"
 project2.task_count = 0
 project2.is_archived = False
 
 # Mock get_projects to return both projects
 mock_project_service_instance.get_projects.return_value = [project1, project2]
 
 # Make the request
 response = await test_client_with_mocks.get("/api/v1/projects/")
 
 # Verify the response
 assert response.status_code == 200
 response_data = response.json()
 assert response_data["success"] is True
 assert "message" in response_data
 assert response_data["total"] == 2
 assert len(response_data["data"]) == 2
 assert response_data["data"][0]["name"] == "Test Project 1"
 assert response_data["data"][1]["name"] == "Test Project 2"
 
 # Verify the service was called correctly
 mock_project_service_instance.get_projects.assert_called()


async def test_update_project_success(
 mock_project_service_instance, # Use the injected service instance mock directly
 mock_audit_log_service_instance, # Use the injected audit service instance mock directly
 mock_current_user, 
 test_client_with_mocks,
 test_user # Add test_user fixture here
):
 """Test updating a project successfully."""
 project_id_to_update = "existing-project-id"
 update_data = {
 "name": "Updated Project Name",
 "description": "Updated description",
 "is_archived": True
 }

 # Create a mock ProjectModel object to be returned by the service
 # Use MagicMock with spec to simulate the model attributes
 mock_updated_project_object = MagicMock(spec=ProjectModel)
 mock_updated_project_object.id = project_id_to_update
 # Populate attributes based on expected outcome after update
 mock_updated_project_object.name = update_data["name"]
 mock_updated_project_object.description = update_data["description"]
 mock_updated_project_object.is_archived = update_data["is_archived"]
 # Simulate other required attributes, potentially based on an original state or defaults
 mock_updated_project_object.task_count = 0 # Assuming task count is not updated via this endpoint directly
 mock_updated_project_object.created_at = datetime.now(timezone.utc) # Simulate datetime object
 mock_updated_project_object.updated_at = datetime.now(timezone.utc) # Simulate datetime object
 mock_updated_project_object.created_by_user_id = test_user.id # Simulate created by user ID
 mock_updated_project_object.template_id = None
 mock_updated_project_object.last_activity_at = datetime.now(timezone.utc)
 mock_updated_project_object.tasks = [] # Assuming this is needed for Project schema validation
 mock_updated_project_object.members = [] # Assuming this is needed for Project schema validation

 # Configure the update_project method return value to be the mock object
 mock_project_service_instance.update_project.return_value = mock_updated_project_object

 # Configure mock_current_user
 mock_current_user_instance = MagicMock(spec=UserModel)
 mock_current_user_instance.id = test_user.id # Use the actual test user ID
 mock_current_user.return_value = mock_current_user_instance

 # Configure the create_log method return value
 mock_audit_log_service_instance.create_log.return_value = MagicMock(spec=AuditLogModel)

 # Make the request
 response = await test_client_with_mocks.put(
 f"/api/v1/projects/{project_id_to_update}",
 json=update_data,
 headers={"Authorization": "Bearer test-token"} # Include authorization header
 )

 # Verify the response
 assert response.status_code == 200
 response_data = response.json()
 assert response_data["success"] is True
 assert "message" in response_data
 assert response_data["data"]["id"] == project_id_to_update # Check ID in the data field
 assert response_data["data"]["name"] == update_data["name"]
 assert response_data["data"]["description"] == update_data["description"]
 assert response_data["data"]["is_archived"] == update_data["is_archived"]

 # Verify the service was called correctly
 mock_project_service_instance.update_project.assert_called_once_with(
 project_id=project_id_to_update,
 project_update=ProjectUpdate(**update_data) # Pass ProjectUpdate instance
 )

 # Verify the audit log service was called with correct details
 mock_audit_log_service_instance.create_log.assert_called_once_with(
 action="update_project",
 user_id=test_user.id,
 details={"project_id": project_id_to_update, "changes": update_data} # Pass raw data or dict as per router logic
 )


async def test_update_project_not_found(
 mock_project_service_instance, 
 test_client_with_mocks,
 mock_current_user # Include mock_current_user dependency
):
 """Test updating a project that does not exist."""
 project_id_to_update = "non-existent-project-id"
 update_data = {
 "name": "Updated Project Name",
 "description": "Updated description",
 "is_archived": False
 }

 # Configure the update_project method to raise EntityNotFoundError
 mock_project_service_instance.update_project.side_effect = EntityNotFoundError(
 entity_type="Project", entity_id=project_id_to_update
 )

 # Configure mock_current_user
 mock_current_user_instance = MagicMock(spec=UserModel)
 mock_current_user_instance.id = "test-user-id" # Simulate a user ID
 mock_current_user.return_value = mock_current_user_instance

 # Make the request
 response = await test_client_with_mocks.put(
 f"/api/v1/projects/{project_id_to_update}",
 json=update_data,
 headers={"Authorization": "Bearer test-token"} # Include authorization header
 )

 # Verify the response status code and detail
 assert response.status_code == 404
 response_data = response.json()
 # Check for the standardized error response structure
 assert "message" in response_data # Check for 'message' key instead of 'detail'
 assert "success" in response_data and response_data["success"] is False
 assert "error_code" in response_data and response_data["error_code"] == "HTTP404"
 assert "Project with ID non-existent-project-id not found" in response_data["message"] # Check for the correct message in 'message' field

 # Verify the service was called correctly
 mock_project_service_instance.update_project.assert_called_once_with(
 project_id=project_id_to_update,
 project_update=ProjectUpdate(**update_data) # Pass ProjectUpdate instance
 )


async def test_delete_project_success(mock_project_service_instance, test_client_with_mocks):
 """Test deleting a project successfully."""
 # Mock the project service to return a project
 project = MagicMock(spec=Project)
 project.id = "test-project-id"
 project.name = "Test Project"
 project.description = "A test project"
 project.task_count = 0
 project.is_archived = False
 mock_project_service_instance.delete_project.return_value = project
 
 # Make the request
 response = await test_client_with_mocks.delete("/api/v1/projects/test-project-id")

 # Debug prints to inspect the response
 print(f"DEBUG: Response status code: {response.status_code}")
 print(f"DEBUG: Response headers: {response.headers}")
 print(f"DEBUG: Response body: {response.text}")

 # Verify the response
 assert response.status_code == 200
 response_data = response.json()
 assert response_data["success"] is True
 assert "message" in response_data
 assert response_data["data"]["id"] == "test-project-id"
 assert response_data["data"]["name"] == "Test Project"
 
 # Verify the service was called correctly
 mock_project_service_instance.delete_project.assert_called_once_with(
 project_id="test-project-id")


async def test_delete_project_not_found(mock_project_service_instance, test_client_with_mocks):
 """Test deleting a non-existent project."""
 # Mock the project service to return None (indicating not found)
 mock_project_service_instance.delete_project.return_value = None

 # Make the request
 response = await test_client_with_mocks.delete("/api/v1/projects/test-project-id")

 # Verify the response
 assert response.status_code == 404
 response_data = response.json()
 # Check for the standardized error response structure
 assert "message" in response_data
 assert "success" in response_data and response_data["success"] is False
 assert "error_code" in response_data # Check for the error code key
 assert "Project not found" in response_data["message"] # Check for the correct message
