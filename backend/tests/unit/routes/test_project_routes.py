"""
Unit tests for the project routes.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import json

from backend.main import app
from backend.models import Project, User
from backend.schemas.project import Project as ProjectSchema
from backend.schemas.api_responses import DataResponse, ListResponse
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError


# Create a test client
client = TestClient(app)


@pytest.fixture
def mock_project_service():
    """Mock the project service."""
    with patch("backend.routers.projects.get_project_service") as mock:
        yield mock


@pytest.fixture
def mock_audit_log_service():
    """Mock the audit log service."""
    with patch("backend.routers.projects.get_audit_log_service") as mock:
        yield mock


@pytest.fixture
def mock_current_user():
    """Mock the current user authentication dependency."""
    with patch("backend.routers.projects.get_current_active_user") as mock:
        user = MagicMock(spec=User)
        user.id = "test-user-id"
        user.username = "testuser"
        mock.return_value = user
        yield mock


def test_create_project_success(mock_project_service, mock_audit_log_service, mock_current_user):
    """Test creating a project successfully."""
    # Mock the project service to return a project
    project = MagicMock(spec=Project)
    project.id = "test-project-id"
    project.name = "Test Project"
    project.description = "A test project"
    project.task_count = 0
    project.is_archived = False
    mock_project_service.return_value.create_project.return_value = project
    
    # Create a request body
    request_body = {
        "name": "Test Project",
        "description": "A test project"
    }
    
    # Make the request
    response = client.post(
        "/projects/",
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
    mock_project_service.return_value.create_project.assert_called_once()
    call_args = mock_project_service.return_value.create_project.call_args[1]
    assert call_args["project"].name == "Test Project"
    assert call_args["project"].description == "A test project"
    assert call_args["created_by_user_id"] == "test-user-id"
    
    # Verify the audit log service was called
    mock_audit_log_service.return_value.create_log.assert_called_once()


def test_create_project_duplicate(mock_project_service, mock_current_user):
    """Test creating a project with a duplicate name."""
    # Mock the project service to raise a DuplicateEntityError
    mock_project_service.return_value.create_project.side_effect = DuplicateEntityError("Project", "Test Project")
    
    # Create a request body
    request_body = {
        "name": "Test Project",
        "description": "A test project"
    }
    
    # Make the request
    response = client.post(
        "/projects/",
        json=request_body,
        headers={"Authorization": "Bearer test-token"}
    )
    
    # Verify the response
    assert response.status_code == 409
    response_data = response.json()
    assert "detail" in response_data
    assert "Test Project" in response_data["detail"]


def test_get_project_success(mock_project_service):
    """Test getting a project successfully."""
    # Mock the project service to return a project
    project = MagicMock(spec=Project)
    project.id = "test-project-id"
    project.name = "Test Project"
    project.description = "A test project"
    project.task_count = 0
    project.is_archived = False
    mock_project_service.return_value.get_project.return_value = project
    
    # Make the request
    response = client.get("/projects/test-project-id")
    
    # Verify the response
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["success"] is True
    assert "message" in response_data
    assert response_data["data"]["id"] == "test-project-id"
    assert response_data["data"]["name"] == "Test Project"
    
    # Verify the service was called correctly
    mock_project_service.return_value.get_project.assert_called_once_with(
        project_id="test-project-id", is_archived=False
    )


def test_get_project_not_found(mock_project_service):
    """Test getting a non-existent project."""
    # Mock the project service to raise an EntityNotFoundError
    mock_project_service.return_value.get_project.side_effect = EntityNotFoundError("Project", "test-project-id")
    
    # Make the request
    response = client.get("/projects/test-project-id")
    
    # Verify the response
    assert response.status_code == 404
    response_data = response.json()
    assert "detail" in response_data
    assert "not found" in response_data["detail"]


def test_get_projects_success(mock_project_service):
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
    mock_project_service.return_value.get_projects.return_value = [project1, project2]
    
    # Make the request
    response = client.get("/projects/")
    
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
    mock_project_service.return_value.get_projects.assert_called()


def test_update_project_success(mock_project_service):
    """Test updating a project successfully."""
    # Mock the project service to return an updated project
    project = MagicMock(spec=Project)
    project.id = "test-project-id"
    project.name = "Updated Project"
    project.description = "An updated test project"
    project.task_count = 0
    project.is_archived = False
    mock_project_service.return_value.update_project.return_value = project
    
    # Create a request body
    request_body = {
        "name": "Updated Project",
        "description": "An updated test project"
    }
    
    # Make the request
    response = client.put(
        "/projects/test-project-id",
        json=request_body
    )
    
    # Verify the response
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["success"] is True
    assert "message" in response_data
    assert response_data["data"]["name"] == "Updated Project"
    assert response_data["data"]["description"] == "An updated test project"
    
    # Verify the service was called correctly
    mock_project_service.return_value.update_project.assert_called_once()
    call_args = mock_project_service.return_value.update_project.call_args[1]
    assert call_args["project_id"] == "test-project-id"
    assert call_args["project_update"].name == "Updated Project"


def test_update_project_not_found(mock_project_service):
    """Test updating a non-existent project."""
    # Mock the project service to raise an EntityNotFoundError
    mock_project_service.return_value.update_project.side_effect = EntityNotFoundError("Project", "test-project-id")
    
    # Create a request body
    request_body = {
        "name": "Updated Project",
        "description": "An updated test project"
    }
    
    # Make the request
    response = client.put(
        "/projects/test-project-id",
        json=request_body
    )
    
    # Verify the response
    assert response.status_code == 404
    response_data = response.json()
    assert "detail" in response_data
    assert "not found" in response_data["detail"]


def test_delete_project_success(mock_project_service):
    """Test deleting a project successfully."""
    # Mock the project service to return a deleted project
    project = MagicMock(spec=Project)
    project.id = "test-project-id"
    project.name = "Test Project"
    project.description = "A test project"
    mock_project_service.return_value.delete_project.return_value = project
    
    # Make the request
    response = client.delete("/projects/test-project-id")
    
    # Verify the response
    assert response.status_code == 200
    response_data = response.json()
    assert "message" in response_data
    assert "deleted successfully" in response_data["message"]
    
    # Verify the service was called correctly
    mock_project_service.return_value.delete_project.assert_called_once_with(
        project_id="test-project-id"
    )


def test_delete_project_not_found(mock_project_service):
    """Test deleting a non-existent project."""
    # Mock the project service to raise an EntityNotFoundError
    mock_project_service.return_value.delete_project.side_effect = EntityNotFoundError("Project", "test-project-id")
    
    # Make the request
    response = client.delete("/projects/test-project-id")
    
    # Verify the response
    assert response.status_code == 404
    response_data = response.json()
    assert "detail" in response_data
    assert "not found" in response_data["detail"]
