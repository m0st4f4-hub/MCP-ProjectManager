# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:45:00Z

import pytest
import httpx
from sqlalchemy.orm import Session

# Assuming conftest.py sets up the app and client fixtures
# Adjust imports based on project structure
from .. import schemas # Relative import for schemas
from ..database import Base # To access metadata if needed directly, though conftest handles setup

# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

async def test_get_root(async_client: httpx.AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Project Manager API"}

# --- Project API Tests ---
async def test_create_project_api(async_client: httpx.AsyncClient):
    response = await async_client.post("/projects/", json={"name": "API Test Project", "description": "Desc"})
    assert response.status_code == 200 # FastAPI typically returns 200 for POST on successful creation by default
    data = response.json()
    assert data["name"] == "API Test Project"
    assert data["id"] is not None
    project_id = data["id"]

    # Test duplicate project name
    response_dup = await async_client.post("/projects/", json={"name": "API Test Project", "description": "Desc"})
    assert response_dup.status_code == 400 # Expecting bad request for duplicate
    assert "already registered" in response_dup.json()["detail"]

async def test_get_projects_api(async_client: httpx.AsyncClient, db_session: Session):
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

    response_not_found = await async_client.get(f"/projects/{project_id + 999}")
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

    response_not_found = await async_client.put(f"/projects/{project_id + 999}", json=update_payload)
    assert response_not_found.status_code == 404

async def test_delete_project_api(async_client: httpx.AsyncClient):
    create_resp = await async_client.post("/projects/", json={"name": "Delete Me Project", "description": "Delete"})
    project_id = create_resp.json()["id"]

    delete_response = await async_client.delete(f"/projects/{project_id}")
    assert delete_response.status_code == 200 # Or 204 if no content returned
    assert delete_response.json()["id"] == project_id

    get_response = await async_client.get(f"/projects/{project_id}")
    assert get_response.status_code == 404

    delete_not_found = await async_client.delete(f"/projects/{project_id + 999}")
    assert delete_not_found.status_code == 404


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

async def test_get_agent_by_name_api(async_client: httpx.AsyncClient):
    agent_name = "API Agent By Name"
    await async_client.post("/agents/", json={"name": agent_name})
    response = await async_client.get(f"/agents/{agent_name}")
    assert response.status_code == 200
    assert response.json()["name"] == agent_name

    response_not_found = await async_client.get(f"/agents/NonExistentAgentName")
    assert response_not_found.status_code == 404
    
async def test_get_agent_by_id_api(async_client: httpx.AsyncClient):
    create_response = await async_client.post("/agents/", json={"name": "API Agent By ID Test"})
    agent_id = create_response.json()["id"]
    response = await async_client.get(f"/agents/id/{agent_id}")
    assert response.status_code == 200
    assert response.json()["id"] == agent_id

    response_not_found = await async_client.get(f"/agents/id/{agent_id + 999}")
    assert response_not_found.status_code == 404

async def test_update_agent_api(async_client: httpx.AsyncClient):
    create_resp = await async_client.post("/agents/", json={"name": "Update Me Agent"})
    agent_id = create_resp.json()["id"]
    
    update_payload = {"name": "Agent Updated Name API"}
    response = await async_client.put(f"/agents/{agent_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Agent Updated Name API"

async def test_delete_agent_api(async_client: httpx.AsyncClient):
    create_resp = await async_client.post("/agents/", json={"name": "Delete Me Agent"})
    agent_id = create_resp.json()["id"]
    delete_response = await async_client.delete(f"/agents/{agent_id}")
    assert delete_response.status_code == 200
    get_response = await async_client.get(f"/agents/id/{agent_id}")
    assert get_response.status_code == 404

# --- Task API Tests (Creation, Get List, Get by ID) ---
async def test_create_task_api(async_client: httpx.AsyncClient):
    # First, create a project and agent to link the task to
    project_resp = await async_client.post("/projects/", json={"name": "Task Project API", "description": "..."})
    project_id = project_resp.json()["id"]
    agent_resp = await async_client.post("/agents/", json={"name": "Task Agent API"})
    agent_name = agent_resp.json()["name"] # Use name for creation as per schema

    task_payload = {"title": "API Test Task", "description": "Task Desc", "project_id": project_id, "agent_name": agent_name}
    response = await async_client.post("/tasks/", json=task_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "API Test Task"
    assert data["project_id"] == project_id
    # In current setup, agent_id is populated by backend based on agent_name
    assert data["agent_id"] == agent_resp.json()["id"]

    # Test task creation with non-existent project/agent (should ideally fail, depends on CRUD logic)
    invalid_task_payload_project = {"title": "Invalid Task", "project_id": 99999, "agent_name": agent_name}
    response_invalid_proj = await async_client.post("/tasks/", json=invalid_task_payload_project)
    assert response_invalid_proj.status_code == 400 # Or 500 if crud.create_task raises ValueError
    
    invalid_task_payload_agent = {"title": "Invalid Task", "project_id": project_id, "agent_name": "NonExistentAgentNameForTask"}
    response_invalid_agent = await async_client.post("/tasks/", json=invalid_task_payload_agent)
    assert response_invalid_agent.status_code == 400 # Or 500

async def test_get_tasks_api(async_client: httpx.AsyncClient):
    project_resp = await async_client.post("/projects/", json={"name": "Task List Project API", "description": "..."})
    project_id_filter = project_resp.json()["id"]
    agent_resp = await async_client.post("/agents/", json={"name": "Task List Agent API"})
    agent_name_filter = agent_resp.json()["name"]

    response_before = await async_client.get("/tasks/")
    tasks_before_count = len(response_before.json())

    await async_client.post("/tasks/", json={"title": "T1", "project_id": project_id_filter, "agent_name": agent_name_filter})
    await async_client.post("/tasks/", json={"title": "T2", "project_id": project_id_filter})
    await async_client.post("/tasks/", json={"title": "T3", "agent_name": agent_name_filter})

    response_all_after = await async_client.get("/tasks/")
    assert len(response_all_after.json()) >= tasks_before_count + 3 # Check relative increase

    # Test filtering
    response_proj_filter = await async_client.get(f"/tasks/?project_id={project_id_filter}")
    assert response_proj_filter.status_code == 200
    # Should be at least 2, exact count depends on other tests
    tasks_for_project = [t for t in response_proj_filter.json() if t["project_id"] == project_id_filter]
    assert len(tasks_for_project) >= 2 

    response_agent_filter = await async_client.get(f"/tasks/?agent_name={agent_name_filter}")
    assert response_agent_filter.status_code == 200
    tasks_for_agent = [t for t in response_agent_filter.json() if t["agent"] and t["agent"]["name"] == agent_name_filter]
    assert len(tasks_for_agent) >= 2

async def test_get_task_by_id_api(async_client: httpx.AsyncClient):
    project_resp = await async_client.post("/projects/", json={"name": "Task By ID Proj API", "description": "..."})
    project_id = project_resp.json()["id"]
    task_payload = {"title": "API Task By ID", "project_id": project_id}
    create_response = await async_client.post("/tasks/", json=task_payload)
    task_id = create_response.json()["id"]

    response = await async_client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "API Task By ID"

    response_not_found = await async_client.get(f"/tasks/{task_id + 9999}")
    assert response_not_found.status_code == 404

async def test_update_task_api(async_client: httpx.AsyncClient):
    proj_resp = await async_client.post("/projects/", json={"name": "TaskUpdate Proj"})
    project_id = proj_resp.json()["id"]
    agent_resp = await async_client.post("/agents/", json={"name": "TaskUpdate Agent"})
    agent_name = agent_resp.json()["name"]

    create_resp = await async_client.post("/tasks/", json={"title": "Update Me Task", "project_id": project_id, "agent_name": agent_name})
    task_id = create_resp.json()["id"]
    
    update_payload = {"title": "Task Updated API", "description": "Updated Desc", "completed": True, "project_id": project_id, "agent_name": agent_name}
    response = await async_client.put(f"/tasks/{task_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Task Updated API"
    assert data["completed"] is True

async def test_delete_task_api(async_client: httpx.AsyncClient):
    proj_resp = await async_client.post("/projects/", json={"name": "TaskDelete Proj"})
    project_id = proj_resp.json()["id"]
    create_resp = await async_client.post("/tasks/", json={"title": "Delete Me Task", "project_id": project_id})
    task_id = create_resp.json()["id"]

    delete_response = await async_client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 200

    get_response = await async_client.get(f"/tasks/{task_id}")
    assert get_response.status_code == 404


# --- Planning Endpoint Test ---
async def test_planning_generate_prompt_api(async_client: httpx.AsyncClient):
    response = await async_client.post("/planning/generate-prompt", json={"goal": "Test the planning prompt generation"})
    assert response.status_code == 200
    data = response.json()
    assert "prompt" in data
    assert "Test the planning prompt generation" in data["prompt"] # Basic check 