# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:45:00Z

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock
import time
from fastapi import HTTPException
from fastapi import FastAPI
import httpx # Added import
from httpx import AsyncClient
from io import StringIO
import logging
import sys
import json # Import json for serializing details
import pytest_asyncio

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks
from backend.crud import agents as crud_agents
from backend.crud import project_members as crud_project_members
from backend.crud import project_file_associations as crud_project_file_associations
from backend.crud import task_file_associations as crud_task_file_associations
from backend.crud import task_dependencies as crud_task_dependencies

# Import lifespan from main
from backend.main import lifespan

# Import necessary services for helper functions
from backend.services import project_service
from backend.services import agent_service
from backend.services.agent_service import AgentService  # Import AgentService
from backend.services.audit_log_service import AuditLogService # Import AuditLogService

# from .conftest import create_test_project, create_test_agent # Removed incorrect imports

# Set up logging - get the logger used in backend.main
logger = logging.getLogger("backend.main")


# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

async def test_get_root(async_client: AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Project Manager API"}

# --- Project API Tests ---
async def test_create_project_api(async_client: AsyncClient):
    response = await async_client.post("/projects/", json={"name": "API Test Project", "description": "Desc"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "API Test Project"
    assert data["id"] is not None
    project_id = data["id"]

    # Test duplicate project name
    response_dup = await async_client.post("/projects/", json={"name": "API Test Project", "description": "Desc"})
    assert response_dup.status_code == 400
    assert "already registered" in response_dup.json()["detail"]

async def test_get_projects_api(async_client: AsyncClient, db_session: Session):
    # Clear existing projects or ensure a known state if necessary, 
    # though tests should be isolated by db_session rollback in conftest.
    response = await async_client.get("/projects/")
    assert response.status_code == 200
    projects_before_count = len(response.json())

    await async_client.post("/projects/", json={"name": "API Get Proj 1", "description": "..."})
    await async_client.post("/projects/", json={"name": "API Get Proj 2", "description": "..."})

    response_after = await async_client.get("/projects/")
    assert response_after.status_code == 200
    assert len(response_after.json()) == projects_before_count + 2

async def test_get_project_by_id_api(async_client: httpx.AsyncClient):
    create_response = await async_client.post("/projects/", json={"name": "API Proj By ID", "description": "Test"})
    assert create_response.status_code == 200
    project_id = create_response.json()["id"]

    response = await async_client.get(f"/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "API Proj By ID"

    response_not_found = await async_client.get(f"/projects/{project_id + "_not_found"}")
    assert response_not_found.status_code == 404

async def test_update_project_api(async_client: httpx.AsyncClient):
    create_resp = await async_client.post("/projects/", json={"name": "Update Me Project", "description": "Initial"})
    project_id = create_resp.json()["id"]
    
    update_payload = {"name": "Project Updated Name API", "description": "New Description API"}
    response = await async_client.put(f"/projects/{project_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Project Updated Name API"
    assert data["description"] == "New Description API"

    response_not_found = await async_client.put(f"/projects/{project_id + "_not_found"}", json=update_payload)
    assert response_not_found.status_code == 404

async def test_delete_project_api(async_client: httpx.AsyncClient):
    create_resp = await async_client.post("/projects/", json={"name": "Delete Me Project", "description": "Delete"})
    project_id = create_resp.json()["id"]

    delete_response = await async_client.delete(f"/projects/{project_id}")
    assert delete_response.status_code == 200 # Or 204 if no content returned
    # assert delete_response.json()["id"] == project_id # This might fail if 204 No Content

    get_response = await async_client.get(f"/projects/{project_id}")
    assert get_response.status_code == 404

    delete_not_found = await async_client.delete(f"/projects/{project_id + "_not_found"}")
    assert delete_not_found.status_code == 404

async def test_update_project_api_generic_exception(async_client: httpx.AsyncClient, db_session: Session, fastapi_app: FastAPI, test_project): # Added test_project fixture
    # project = create_test_project(db_session, name="ProjectForGenericError") # Removed call
    # Updated mock path to use the specific crud submodule
    with mock.patch("backend.routers.projects.ProjectService.update_project", side_effect=HTTPException(status_code=500, detail="CRUD generic error")):
        response = await async_client.put(f"/projects/{test_project.id}", json={"name": "Updated Name"})
    assert response.status_code == 500
    # For HTTPException, FastAPI returns the detail as-is
    assert response.json()["detail"] == "CRUD generic error"

async def test_project_update_value_error(async_client: httpx.AsyncClient, db_session: Session, test_project): # Added test_project fixture
    # Create a project
    # project = create_test_project(db_session, name="Project for Value Error") # Removed call
    
    # Create another project to cause a name conflict
    other_project = create_test_project(db_session, name="Existing Project Name")
    
    # Try to update the first project with the name of the second project
    update_payload = {"name": "Existing Project Name"}
    response = await async_client.put(f"/projects/{test_project.id}", json=update_payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

async def test_update_project_api_http_exception(async_client: httpx.AsyncClient, db_session: Session, test_project): # Added test_project fixture
    # Create a project
    # project = create_test_project(db_session, name="Project for HTTP Exception") # Removed call
    
    # Mock crud.update_project to raise an HTTPException
    # Updated mock path to use the specific crud submodule
    with mock.patch("backend.routers.projects.ProjectService.update_project", side_effect=HTTPException(status_code=418, detail="I'm a teapot")):
        response = await async_client.put(f"/projects/{test_project.id}", json={"name": "Updated Name"})
        assert response.status_code == 418
        assert response.json()["detail"] == "I'm a teapot"

# --- Agent API Tests (similar structure to Projects) ---
async def test_create_agent_api(async_client: httpx.AsyncClient):
    response = await async_client.post("/agents/", json={"name": "API Test Agent"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "API Test Agent"
    assert data["id"] is not None

    response_dup = await async_client.post("/agents/", json={"name": "API Test Agent"})
    assert response_dup.status_code == 400

async def test_get_agents_api(async_client: httpx.AsyncClient):
    response_before = await async_client.get("/agents/")
    agents_before_count = len(response_before.json())

    await async_client.post("/agents/", json={"name": "API Get Agent 1"})
    await async_client.post("/agents/", json={"name": "API Get Agent 2"})

    response_after = await async_client.get("/agents/")
    assert response_after.status_code == 200
    assert len(response_after.json()) == agents_before_count + 2

async def test_get_agent_by_id_api(async_client: httpx.AsyncClient):
    create_response = await async_client.post("/agents/", json={"name": "API Agent By ID Test"})
    assert create_response.status_code == 200 # Ensure agent creation was successful
    agent_id = create_response.json()["id"]

    response = await async_client.get(f"/agents/id/{agent_id}")
    assert response.status_code == 200
    assert response.json()["id"] == agent_id

    response_not_found = await async_client.get(f"/agents/id/{agent_id + "_not_found"}")
    assert response_not_found.status_code == 404

async def test_update_agent_api(async_client: httpx.AsyncClient):
    create_response = await async_client.post("/agents/", json={"name": "AgentToUpdateAPI"})
    assert create_response.status_code == 200
    agent_id = create_response.json()["id"]

    update_payload_agent = {"name": "Agent Updated Name API"}
    response = await async_client.put(f"/agents/{agent_id}", json=update_payload_agent)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Agent Updated Name API"
    
    # Check trying to update a non-existent agent
    response_not_found = await async_client.put(f"/agents/{agent_id + "_not_found"}", json=update_payload_agent)
    assert response_not_found.status_code == 404

async def test_delete_agent_api(async_client: httpx.AsyncClient):
    create_resp = await async_client.post("/agents/", json={"name": "Delete Me Agent"})
    assert create_resp.status_code == 200
    agent_id = create_resp.json()["id"]

    delete_response = await async_client.delete(f"/agents/{agent_id}")
    assert delete_response.status_code == 200
    # assert delete_response.json()["id"] == agent_id # This might fail if 204 No Content

    get_response = await async_client.get(f"/agents/id/{agent_id}") # Check by ID
    assert get_response.status_code == 404
    
    delete_not_found = await async_client.delete(f"/agents/{agent_id + "_not_found"}")
    assert delete_not_found.status_code == 404

async def test_update_agent_api_generic_exception(async_client: httpx.AsyncClient, db_session: Session, fastapi_app: FastAPI, test_agent): # Added test_agent fixture
    # agent = create_test_agent(db_session, name="AgentForGenericError") # Removed call
    # Updated mock path to use the specific crud submodule
    with mock.patch("backend.routers.agents.AgentService.update_agent", side_effect=Exception("Generic agent error")):
        response = await async_client.put(f"/agents/{test_agent.id}", json={"name": "Updated Agent Name"}) # Assuming agent_id is used in path
    assert response.status_code == 500
    # For HTTPException, FastAPI returns the detail as-is
    assert response.json()["detail"] == "Internal server error: Generic agent error"
    # For now, focus on covering the raise HTTPException line

async def test_agent_update_value_error(async_client: httpx.AsyncClient, db_session: Session, test_agent): # Added test_agent fixture
    # Create an agent
    # agent = create_test_agent(db_session, name="Agent for Value Error") # Removed call
    
    # Create another agent to cause a name conflict
    other_agent = create_test_agent(db_session, name="Existing Agent Name")
    
    # Try to update the first agent with the name of the second agent
    update_payload = {"name": "Existing Agent Name"}
    response = await async_client.put(f"/agents/{test_agent.id}", json=update_payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

async def test_update_agent_api_http_exception(async_client: httpx.AsyncClient, db_session: Session, test_agent): # Added test_agent fixture
    # Create an agent
    # agent = create_test_agent(db_session, name="Agent for HTTP Exception") # Removed call
    
    # Mock crud.update_agent to raise an HTTPException
    # Updated mock path to use the specific crud submodule
    with mock.patch("backend.routers.agents.AgentService.update_agent", side_effect=HTTPException(status_code=418, detail="I'm a teapot")):
        response = await async_client.put(f"/agents/{test_agent.id}", json={"name": "Updated Name"})
        assert response.status_code == 418
        assert response.json()["detail"] == "I'm a teapot"

# --- Task API Tests (Creation, Get List, Get by ID) ---
async def test_create_task_api(async_client: httpx.AsyncClient, test_project, test_agent): # Added fixtures
    # First, create a project and agent to link the task to
    # create_response = await async_client.post("/projects/", json={"name": "Task Test Project", "description": "..."})
    # assert create_response.status_code == 200
    # project_id = create_response.json()["id"]

    # create_agent_response = await async_client.post("/agents/", json={"name": "Task Test Agent"})
    # assert create_agent_response.status_code == 200
    # agent_id = create_agent_response.json()["id"]
    
    # Use fixture IDs
    project_id = test_project.id
    agent_id = test_agent.id

    task_payload = {
        "project_id": project_id,
        "title": "API Test Task",
        "description": "...",
        "status": "To Do",
        "assigned_agent_id": agent_id # Assign the agent
    }
    response = await async_client.post(f"/projects/{project_id}/tasks/", json=task_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "API Test Task"
    assert data["project_id"] == project_id
    assert data["assigned_agent_id"] == agent_id
    assert data["task_number"] is not None # Task number is assigned by the backend

    # Test duplicate task number within the same project (should not happen with backend logic)
    # However, a duplicate title within the same project might be a validation error to test
    # (Assuming title uniqueness is desired per project)
    # For now, skip duplicate task number test as backend logic should handle

async def test_get_tasks_api(async_client: httpx.AsyncClient, db_session: Session, test_project): # Added test_project
    # Clear existing tasks or ensure a known state
    # This test will rely on the db_session rollback for isolation

    # Create some tasks using the service or crud directly for setup efficiency
    # Or, since we're testing the API, create them via API calls
    # Create a project first
    # create_proj_resp = await async_client.post("/projects/", json={"name": "Get Tasks Proj", "description": "..."})
    # assert create_proj_resp.status_code == 200
    # project_id = create_proj_resp.json()["id"]
    project_id = test_project.id

    # Create tasks via API
    await async_client.post(f"/projects/{project_id}/tasks/", json={
        "project_id": project_id,
        "title": "Get Task 1",
        "description": "...",
        "status": "To Do"
    })
    await async_client.post(f"/projects/{project_id}/tasks/", json={
        "project_id": project_id,
        "title": "Get Task 2",
        "description": "...",
        "status": "In Progress"
    })

    # Get tasks for the project
    response = await async_client.get(f"/projects/{project_id}/tasks/")
    assert response.status_code == 200
    tasks = response.json()
    # Assuming the two tasks created above are the only ones for this project in this session
    assert len(tasks) >= 2 # We expect at least the two we just created
    # Check for the presence of the created tasks
    task_titles = [task["title"] for task in tasks]
    assert "Get Task 1" in task_titles
    assert "Get Task 2" in task_titles

    # Test getting tasks for a non-existent project
    response_not_found = await async_client.get(f"/projects/{uuid.uuid4()}/tasks/")
    assert response_not_found.status_code == 404 # Corrected typo and comparison
    # Or 200 with empty list, depends on backend
    # Based on current router logic, it should probably be 404 if project not found
    # But if it returns an empty list for a non-existent project, that might also be acceptable depending on requirements.
    # Let's assume 404 is the intended behavior for now.
    # assert response_not_found.status_code == 404 # Removed duplicate assertion

async def test_get_task_by_id_api(async_client: httpx.AsyncClient, test_project, test_task): # Added fixtures
    # project_id = test_project.id # Use fixture ID
    # task_number = test_task.task_number # Use fixture task number
    # This test uses the test_task fixture which already belongs to test_project
    
    response = await async_client.get(f"/projects/{test_task.project_id}/tasks/{test_task.task_number}")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == test_task.project_id
    assert data["task_number"] == test_task.task_number
    assert data["title"] == "Test Task"

    # Test getting a task for a non-existent project
    response_proj_not_found = await async_client.get(f"/projects/{uuid.uuid4()}/tasks/{test_task.task_number}")
    assert response_proj_not_found.status_code == 404

    # Test getting a non-existent task for an existing project
    response_task_not_found = await async_client.get(f"/projects/{test_task.project_id}/tasks/{test_task.task_number + 999}")
    assert response_task_not_found.status_code == 404

async def test_update_task_api(async_client: httpx.AsyncClient, test_project, test_task): # Added fixtures
    # project_id = test_project.id # Use fixture ID
    # task_number = test_task.task_number # Use fixture task number
    
    update_payload = {"title": "Task Updated Name API", "description": "New Task Description API", "status": "In Progress"}
    response = await async_client.put(f"/projects/{test_task.project_id}/tasks/{test_task.task_number}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Task Updated Name API"
    assert data["description"] == "New Task Description API"
    assert data["status"] == "In Progress"

    # Test updating a non-existent task for an existing project
    response_task_not_found = await async_client.put(f"/projects/{test_task.project_id}/tasks/{test_task.task_number + 999}", json=update_payload)
    assert response_task_not_found.status_code == 404

    # Test updating a task for a non-existent project
    response_proj_not_found = await async_client.put(f"/projects/{uuid.uuid4()}/tasks/{test_task.task_number}", json=update_payload)
    assert response_proj_not_found.status_code == 404

async def test_delete_task_api(async_client: httpx.AsyncClient, test_project, test_task): # Added fixtures
    # project_id = test_project.id # Use fixture ID
    # task_number = test_task.task_number # Use fixture task number

    delete_response = await async_client.delete(f"/projects/{test_task.project_id}/tasks/{test_task.task_number}")
    assert delete_response.status_code == 200 # Or 204

    get_response = await async_client.get(f"/projects/{test_task.project_id}/tasks/{test_task.task_number}")
    assert get_response.status_code == 404

    # Test deleting a non-existent task for an existing project
    delete_not_found = await async_client.delete(f"/projects/{test_task.project_id}/tasks/{test_task.task_number + 999}")
    assert delete_not_found.status_code == 404

    # Test deleting a task for a non-existent project
    delete_proj_not_found = await async_client.delete(f"/projects/{uuid.uuid4()}/tasks/{test_task.task_number}")
    assert delete_proj_not_found.status_code == 404

async def test_task_update_value_error(async_client: httpx.AsyncClient, db_session: Session, test_project, test_task): # Added fixtures
    # Create a project and task
    # project = create_test_project(db_session, name="Task for Value Error Project") # Removed call
    # task = create_test_task(db_session, project_id=project.id, title="Task for Value Error") # Removed call
    # Use fixtures
    project = test_project
    task = test_task
    
    # Create another task with a duplicate title in the same project
    other_task = crud_tasks.create_task(db_session, schemas.TaskCreate(
        project_id=project.id,
        title="Existing Task Title",
        description="...",
        status="To Do"
    ))
    db_session.commit()

    # Try to update the first task with the title of the second task
    update_payload = {"title": "Existing Task Title"}
    response = await async_client.put(f"/projects/{task.project_id}/tasks/{task.task_number}", json=update_payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

# --- Task Sub-task API Tests ---
# (All subtask and parent_task_id related tests have been removed as subtasks are deprecated.)

# Deletion cascade is primarily a DB/model concern, tested in test_crud.
# API delete endpoint behavior remains the same (deletes the specified task).
# If subtasks are orphaned or deleted by cascade, that's an effect, not a direct API test of subtask deletion.

# --- MCP Docs Endpoint Test ---
async def test_get_mcp_docs_api(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    """Test the /mcp-docs endpoint with a mock MCP instance."""
    # Create a mock MCP instance
    mock_mcp_instance = mock.MagicMock()
    mock_mcp_instance.tools = {
        "test_tool": {
            "description": "A test tool"
        }
    }
    
    # Store original state
    original_routes = list(fastapi_app.router.routes)
    original_app_state_mcp_exists = hasattr(fastapi_app.state, 'mcp_instance')
    original_app_state_mcp_value = getattr(fastapi_app.state, 'mcp_instance', None)

    try:
        # Set up the mock MCP instance
        fastapi_app.state.mcp_instance = mock_mcp_instance
        
        # Add test routes
        @fastapi_app.get("/test-route", name="test_route", description="A test route")
        async def test_route():
            return {"message": "test"}

        # Make the request
        response = await async_client.get("/mcp-docs")
        assert response.status_code == 200
        data = response.json()

        # Verify the response
        assert "routes" in data
        assert "tools" in data
        assert "mcp_project_manager_tools_documentation" in data
        assert data["tools"] == mock_mcp_instance.tools

        # Verify routes
        routes = data["routes"]
        test_route = next((r for r in routes if r["path"] == "/test-route"), None)
        assert test_route is not None
        assert test_route["name"] == "test_route"
        assert test_route["description"] == "A test route"
        assert test_route["methods"] == ["GET"]

        # Verify markdown documentation
        docs_md = data["mcp_project_manager_tools_documentation"]
        assert "# MCP Project Manager Tools Documentation" in docs_md
        assert "test_tool" in docs_md
        assert "A test tool" in docs_md
        assert "test_route" in docs_md
        assert "A test route" in docs_md

    finally:
        # Restore original state
        if original_app_state_mcp_exists:
            fastapi_app.state.mcp_instance = original_app_state_mcp_value
        elif hasattr(fastapi_app.state, 'mcp_instance'):
            delattr(fastapi_app.state, 'mcp_instance')
        
        # Restore original routes
        fastapi_app.router.routes.clear()
        fastapi_app.router.routes.extend(original_routes)


async def test_get_mcp_docs_scenario_no_tools_found(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    global_mcp_path = 'backend.main.mcp' # Path to the global mcp instance in main.py

    # Mocks to ensure no tools are found via mcp_instance.tools
    mock_mcp_instance_for_state = mock.MagicMock()
    mock_mcp_instance_for_state.tools = None # Crucial: ensures isinstance(..., dict) check fails or .tools is empty

    mock_mcp_global_instance = mock.MagicMock()
    mock_mcp_global_instance.tools = None # Crucial for the global fallback

    app_under_test = fastapi_app

    # Store original routes and app.state.mcp_instance to restore them later
    original_routes = list(app_under_test.router.routes) # Make a copy
    original_app_state_mcp_exists = hasattr(app_under_test.state, 'mcp_instance')
    original_app_state_mcp_value = getattr(app_under_test.state, 'mcp_instance', None)

    # Prepare a minimal set of routes consisting only of paths that are explicitly excluded
    # by the get_mcp_tool_documentation function's route iteration logic.
    excluded_routes_to_keep = []
    for r_orig in original_routes:
        if hasattr(r_orig, "path") and r_orig.path in ("/mcp-docs", "/openapi.json", "/docs"):
            excluded_routes_to_keep.append(r_orig)

    # Ensure the /mcp-docs route itself is present, otherwise the client call would fail.
    if not any(hasattr(r, "path") and r.path == "/mcp-docs" for r in excluded_routes_to_keep):
        # This should not happen if fastapi_app is correctly set up with main_fastapi_app
        # but it's a safeguard for the test's own logic.
        mcp_docs_route_obj = next((r for r in original_routes if hasattr(r, "path") and r.path == "/mcp-docs"), None)
        if mcp_docs_route_obj:
            excluded_routes_to_keep.append(mcp_docs_route_obj)
        else:
            raise AssertionError("The /mcp-docs route object was not found in original_routes for the test setup.")

    try:
        # 1. Set app.state.mcp_instance to our mock that has no tools
        # This targets the 'getattr(request.app.state, 'mcp_instance', None)' in get_mcp_tool_documentation
        app_under_test.state.mcp_instance = mock_mcp_instance_for_state

        # 2. Modify app.routes to only contain routes that will be filtered out by the exclusion logic
        app_under_test.router.routes.clear()
        app_under_test.router.routes.extend(excluded_routes_to_keep)

        # 3. Patch the global 'mcp' instance in backend.main, also to have no tools
        # This targets the 'global mcp; mcp_instance = mcp' fallback in get_mcp_tool_documentation
        with mock.patch(global_mcp_path, mock_mcp_global_instance, create=True):
            response = await async_client.get("/mcp-docs")
            assert response.status_code == 200
            data = response.json()

            # Verify the entire content of the documentation string matches exactly.
            expected_content = "# MCP Project Manager Tools Documentation\n\nNo MCP project-manager tools found via route inspection or MCP router not fully initialized at the time of this request for the /mcp-docs path."
            assert data["mcp_project_manager_tools_documentation"] == expected_content

    finally:
        # Restore original state
        if original_app_state_mcp_exists:
            app_under_test.state.mcp_instance = original_app_state_mcp_value
        elif hasattr(app_under_test.state, 'mcp_instance'):
            delattr(app_under_test.state, 'mcp_instance')
        
        # Restore original routes
        app_under_test.router.routes.clear()
        app_under_test.router.routes.extend(original_routes)

# --- Planning Endpoint Test ---
async def test_planning_generate_prompt_api(async_client: httpx.AsyncClient):
    response = await async_client.post("/planning/generate-prompt", json={"goal": "Test the planning prompt generation"})
    assert response.status_code == 200
    data = response.json()
    assert "prompt" in data
    assert "Test the planning prompt generation" in data["prompt"] # Basic check 

async def test_create_task_api_generic_exception(async_client: httpx.AsyncClient):
    # Create a valid project and agent first for the payload
    project_resp = await async_client.post("/projects/", json={"name": "Task Project for Exc Test"})
    assert project_resp.status_code == 200
    project_id = project_resp.json()["id"]
    agent_resp = await async_client.post("/agents/", json={"name": "Task Agent for Exc Test"})
    assert agent_resp.status_code == 200
    agent_name = agent_resp.json()["name"]

    task_payload = {"title": "Task Causing Exception", "project_id": project_id, "agent_name": agent_name}
    
    # Patch 'backend.crud.create_task' to raise a generic exception
    with mock.patch('backend.routers.projects.TaskService.create_task', side_effect=Exception("DB commit failed unexpectedly")):
        response = await async_client.post(f"/projects/{project_id}/tasks/", json=task_payload)
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"]
        assert "DB commit failed unexpectedly" in response.json()["detail"]

async def test_update_task_api_generic_exception(async_client: httpx.AsyncClient):
    # Create a project and task to update
    project_resp = await async_client.post("/projects/", json={"name": "Project for Task Update Exc"})
    project_id = project_resp.json()["id"]
    task_resp = await async_client.post(f"/projects/{project_id}/tasks/", json={"title": "Task for Update Exc", "project_id": project_id})
    task_number = task_resp.json()["task_number"]
    update_payload = {"title": "Updated Title during Exc Test"}

    with mock.patch('backend.routers.projects.TaskService.update_task', side_effect=Exception("Generic task error")):
        response = await async_client.put(f"/projects/{project_id}/tasks/{task_number}", json=update_payload)
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"]
        assert "Generic task error" in response.json()["detail"]

async def test_delete_task_api_generic_exception(async_client: httpx.AsyncClient, db_session: Session):
    # Create a project and task to delete
    project_resp = await async_client.post("/projects/", json={"name": "Project for Delete Exc"})
    project_id = project_resp.json()["id"]
    task_resp = await async_client.post(f"/projects/{project_id}/tasks/", json={"title": "Task for Delete Exc", "project_id": project_id})
    task_number = task_resp.json()["task_number"]

    with mock.patch('backend.routers.projects.TaskService.delete_task_by_project_and_number', side_effect=Exception("Delete DB failed")):
        response = await async_client.delete(f"/projects/{project_id}/tasks/{task_number}")
    
    assert response.status_code == 500
    assert response.json()["detail"] == "Internal server error during task deletion: Something went wrong"

async def test_get_mcp_docs_api_line_121_unnamed_route(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    # Test specifically for line 121 (unnamed_route generation).
    original_routes = list(fastapi_app.router.routes)
    
    # This route, with an empty name & op_id, and a path that becomes "" after processing,
    # should trigger line 121 in get_mcp_tool_documentation.
    @fastapi_app.get("/{}", name="", operation_id="")
    async def dummy_route_for_line_121():
        return {"message": "dummy for line 121"}

    try:
        response = await async_client.get("/mcp-docs")
        assert response.status_code == 200
        data = response.json()
        docs_md = data["mcp_project_manager_tools_documentation"]
        
        expected_tool_name_segment = "mcp_project-manager_unnamed_route"
        expected_original_path = "Original Path**: `/{}`"

        assert expected_tool_name_segment in docs_md
        assert expected_original_path in docs_md

    finally:
        # Restore original routes
        fastapi_app.router.routes.clear()
        fastapi_app.router.routes.extend(original_routes)

async def test_app_lifespan(fastapi_app: FastAPI):
    # Test the lifespan context manager by capturing logs
    import logging
    from io import StringIO

    # Get the logger used by backend.main
    main_logger = logging.getLogger("backend.main")

    # Create a StringIO handler to capture logs
    log_stream = StringIO()
    handler = logging.StreamHandler(log_stream)
    # Set a basic format for capture, consider matching app's format if complex
    formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)

    # Add the handler and set logger level to capture INFO messages
    original_level = main_logger.level
    main_logger.setLevel(logging.INFO)
    main_logger.addHandler(handler)

    try:
        async with lifespan(fastapi_app):
            pass  # Let the context manager do its thing
        
        # Get the captured output
        output = log_stream.getvalue()

        # Assert that the expected log messages are in the output
        assert "Starting up..." in output # Updated expected log message
        assert "[LIFESPAN] Application shutdown..." in output

    finally:
        # Clean up: remove the handler and restore original logger level
        main_logger.removeHandler(handler)
        main_logger.setLevel(original_level)

async def test_get_mcp_docs_empty_path(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    # Test the case where a route's path becomes empty after processing
    original_routes = list(fastapi_app.router.routes)
    
    # Add a route with a path that will become empty after processing
    @fastapi_app.get("/{}", name="", operation_id="")
    async def empty_path_route():
        return {"message": "empty path"}
    
    try:
        response = await async_client.get("/mcp-docs")
        assert response.status_code == 200
        data = response.json()
        docs_md = data["mcp_project_manager_tools_documentation"]
        
        # The empty path should result in an "unnamed_route" tool name
        assert "mcp_project-manager_unnamed_route" in docs_md
        assert "Original Path**: `/{}`" in docs_md
    finally:
        # Restore original routes
        fastapi_app.router.routes.clear()
        fastapi_app.router.routes.extend(original_routes)

async def test_project_agent_task_generic_exceptions(async_client: httpx.AsyncClient, db_session: Session, fastapi_app: FastAPI, test_project, test_agent, test_task): # Added fixtures
    # Create test data (using fixtures instead of calls)
    # project = create_test_project(db_session, name="ProjectForGenericError")
    # agent = create_test_agent(db_session, name="AgentForGenericError")
    # task = create_test_task(db_session, project_id=project.id, title="TaskForGenericError")
    project = test_project
    agent = test_agent
    task = test_task

    # Test generic exception in update_project
    with mock.patch("backend.routers.projects.ProjectService.update_project", side_effect=Exception("Project generic error")):
        response = await async_client.put(f"/projects/{project.id}", json={"name": "Updated Name"})
    assert response.status_code == 500
    assert "Internal server error" in response.json()["detail"]

    # Test generic exception in update_agent
    with mock.patch("backend.routers.agents.AgentService.update_agent", side_effect=Exception("Agent generic error")):
        response = await async_client.put(f"/agents/{agent.id}", json={"name": "Updated Agent Name"})
    assert response.status_code == 500
    assert "Internal server error" in response.json()["detail"]

    # Test generic exception in update_task
    with mock.patch("backend.routers.tasks.TaskService.update_task", side_effect=Exception("Task generic error")):
        response = await async_client.put(f"/projects/{task.project_id}/tasks/{task.task_number}", json={"title": "Updated Task Title"})
    assert response.status_code == 500
    assert "Internal server error" in response.json()["detail"]

async def test_project_member_api(async_client: httpx.AsyncClient, db_session: Session, test_project, test_user): # Added fixtures
    # Create a project and a user (using fixtures)
    # project = create_test_project(db_session, name="Project for Members")
    # user = create_test_user(db_session)
    project = test_project
    user = test_user

    # Test adding a member
    add_member_payload = {"user_id": user.id, "role": "member"}
    response = await async_client.post(f"/projects/{project.id}/members/", json=add_member_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == project.id
    assert data["user_id"] == user.id
    assert data["role"] == "member"

    # Test adding the same member again
    response_dup = await async_client.post(f"/projects/{project.id}/members/", json=add_member_payload)
    assert response_dup.status_code == 400

    # Test getting members for the project
    get_members_response = await async_client.get(f"/projects/{project.id}/members/")
    assert get_members_response.status_code == 200
    members = get_members_response.json()
    assert len(members) >= 1
    assert any(m["user_id"] == user.id for m in members)

    # Test getting members for a non-existent project
    response_proj_not_found = await async_client.get(f"/projects/{uuid.uuid4()}/members/")
    assert response_proj_not_found.status_code == 404

    # Test removing a member
    remove_member_response = await async_client.delete(f"/projects/{project.id}/members/{user.id}")
    assert remove_member_response.status_code == 200

    # Test removing a non-existent member
    remove_not_found = await async_client.delete(f"/projects/{project.id}/members/{uuid.uuid4()}")
    assert remove_not_found.status_code == 404

async def test_project_file_association_api(async_client: httpx.AsyncClient, db_session: Session, test_project): # Added fixture
    # Create a project (using fixture)
    # project = create_test_project(db_session, name="Project for Files")
    project = test_project

    # Test creating a file association
    add_file_payload = {"file_path": "/path/to/file1", "description": "File 1"}
    response = await async_client.post(f"/projects/{project.id}/files/", json=add_file_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == project.id
    assert data["file_path"] == "/path/to/file1"

    # Test adding the same file again (assuming file_path is unique per project)
    # This might depend on backend validation, testing for 400 is reasonable
    response_dup = await async_client.post(f"/projects/{project.id}/files/", json=add_file_payload)
    assert response_dup.status_code == 400

    # Test getting files for the project
    get_files_response = await async_client.get(f"/projects/{project.id}/files/")
    assert get_files_response.status_code == 200
    files = get_files_response.json()
    assert len(files) >= 1
    assert any(f["file_path"] == "/path/to/file1" for f in files)

    # Test getting files for a non-existent project
    response_proj_not_found = await async_client.get(f"/projects/{uuid.uuid4()}/files/")
    assert response_proj_not_found.status_code == 404

    # Test removing a file association
    # Need the file_id to delete. The create response returns it.
    file_id_to_delete = data["id"]
    remove_file_response = await async_client.delete(f"/projects/{project.id}/files/{file_id_to_delete}")
    assert remove_file_response.status_code == 200 # Or 204

    # Test removing a non-existent file association
    remove_not_found = await async_client.delete(f"/projects/{project.id}/files/{uuid.uuid4()}")
    assert remove_not_found.status_code == 404

async def test_task_file_association_api(async_client: httpx.AsyncClient, db_session: Session, test_project, test_task): # Added fixtures
    # Create a project and a task (using fixtures)
    # project = create_test_project(db_session, name="Project for Task Files")
    # task = create_test_task(db_session, project_id=project.id, title="Task for Files")
    project = test_project
    task = test_task

    # Test creating a file association for a task
    add_file_payload = {"file_path": "/path/to/task_file1", "description": "Task File 1"}
    response = await async_client.post(f"/projects/{task.project_id}/tasks/{task.task_number}/files/", json=add_file_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == task.project_id
    assert data["task_number"] == task.task_number
    assert data["file_path"] == "/path/to/task_file1"

    # Test adding the same file again (assuming file_path is unique per task)
    # This might depend on backend validation, testing for 400 is reasonable
    response_dup = await async_client.post(f"/projects/{task.project_id}/tasks/{task.task_number}/files/", json=add_file_payload)
    assert response_dup.status_code == 400

    # Test getting files for the task
    get_files_response = await async_client.get(f"/projects/{task.project_id}/tasks/{task.task_number}/files/")
    assert get_files_response.status_code == 200
    files = get_files_response.json()
    assert len(files) >= 1
    assert any(f["file_path"] == "/path/to/task_file1" for f in files)

    # Test getting files for a non-existent task
    response_task_not_found = await async_client.get(f"/projects/{task.project_id}/tasks/{task.task_number + 999}/files/")
    assert response_task_not_found.status_code == 404

    # Test getting files for a non-existent project
    response_proj_not_found = await async_client.get(f"/projects/{uuid.uuid4()}/tasks/{task.task_number}/files/")
    assert response_proj_not_found.status_code == 404

    # Test removing a file association
    # Need the file_id to delete. The create response returns it.
    file_id_to_delete = data["id"]
    remove_file_response = await async_client.delete(f"/projects/{task.project_id}/tasks/{task.task_number}/files/{file_id_to_delete}")
    assert remove_file_response.status_code == 200 # Or 204

    # Test removing a non-existent file association
    remove_not_found = await async_client.delete(f"/projects/{task.project_id}/tasks/{task.task_number}/files/{uuid.uuid4()}")
    assert remove_not_found.status_code == 404

async def test_task_dependency_api(async_client: httpx.AsyncClient, db_session: Session, test_project, test_task): # Added fixtures
    # Create a project and a few tasks (using fixtures)
    # project = create_test_project(db_session, name="Project for Dependencies") # Removed call
    # task1 = create_test_task(db_session, project_id=project.id, title="Task 1") # Removed call
    # task2 = create_test_task(db_session, project_id=project.id, title="Task 2") # Removed call
    project = test_project
    task1 = test_task # Use the existing fixture task as task1

    # Create a second task specifically for this test
    task2 = crud_tasks.create_task(db_session, schemas.TaskCreate(
        project_id=project.id,
        title="Task 2 for Dependency Test",
        description="...",
        status="To Do"
    ))
    db_session.commit()
    db_session.refresh(task2)

    # Test creating a dependency (task1 depends on task2)
    add_dependency_payload = {"dependent_task_number": task1.task_number, "dependency_task_number": task2.task_number}
    response = await async_client.post(f"/projects/{project.id}/dependencies/", json=add_dependency_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == project.id
    assert data["dependent_task_number"] == task1.task_number
    assert data["dependency_task_number"] == task2.task_number

    # Test adding the same dependency again
    response_dup = await async_client.post(f"/projects/{project.id}/dependencies/", json=add_dependency_payload)
    assert response_dup.status_code == 400 # Assuming duplicate dependencies are not allowed

    # Test getting dependencies for a project
    get_dependencies_response = await async_client.get(f"/projects/{project.id}/dependencies/")
    assert get_dependencies_response.status_code == 200
    dependencies = get_dependencies_response.json()
    assert len(dependencies) >= 1 # At least the one we just added
    assert any(d["dependent_task_number"] == task1.task_number and d["dependency_task_number"] == task2.task_number for d in dependencies)

    # Test getting dependencies for a non-existent project
    response_proj_not_found = await async_client.get(f"/projects/{uuid.uuid4()}/dependencies/")
    assert response_proj_not_found.status_code == 404

    # Test removing a dependency
    # Need the dependency_id to delete. The create response returns it.
    dependency_id_to_delete = data["id"]
    remove_dependency_response = await async_client.delete(f"/projects/{project.id}/dependencies/{dependency_id_to_delete}")
    assert remove_dependency_response.status_code == 200 # Or 204

    # Test removing a non-existent dependency
    remove_not_found = await async_client.delete(f"/projects/{project.id}/dependencies/{uuid.uuid4()}")
    assert remove_not_found.status_code == 404

    # Test circular dependency detection (assuming backend logic prevents this)
    add_circular_dependency_payload = {"dependent_task_number": task2.task_number, "dependency_task_number": task1.task_number}
    response_circular = await async_client.post(f"/projects/{project.id}/dependencies/", json=add_circular_dependency_payload)
    assert response_circular.status_code == 400 # Assuming 400 for validation error

    # Test self-dependency detection (assuming backend logic prevents this)
    add_self_dependency_payload = {"dependent_task_number": task1.task_number, "dependency_task_number": task1.task_number}
    response_self = await async_client.post(f"/projects/{project.id}/dependencies/", json=add_self_dependency_payload)
    assert response_self.status_code == 400 # Assuming 400 for validation error

async def test_create_audit_log_entry(fastapi_app: FastAPI, db_session: Session, test_user): # Added test_user fixture
    # ... existing code ...
    audit_log_data = {
        "action": "user.login",
        "user_id": "1", # User ID should be string based on models.py
        "details": {"ip_address": "192.168.1.100"},
        "entity_type": "user", # Added entity_type and entity_id as they are required by schema
        "entity_id": "1",
    }
    # ... existing code ...
    audit_log_service = AuditLogService(db_session)
    audit_log_entry = audit_log_service.create_log_entry(
        action=audit_log_data["action"],
        user_id=audit_log_data["user_id"],
        details=audit_log_data["details"], # Pass details as a dictionary
        entity_type=audit_log_data["entity_type"], # Pass required fields
        entity_id=audit_log_data["entity_id"], # Pass required fields
    )
    # ... existing code ...
    assert audit_log_entry.entity_type == "user" # Added assertion
    assert audit_log_entry.entity_id == "1" # Added assertion

import pytest


def test_simple_can_be_collected():
    assert True