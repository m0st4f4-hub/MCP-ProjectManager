# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:45:00Z

import pytest
import httpx
from sqlalchemy.orm import Session
import uuid
from unittest import mock # ADDED IMPORT
from fastapi import FastAPI, HTTPException

# Assuming conftest.py sets up the app and client fixtures
# Adjust imports based on project structure
from .. import schemas # Relative import for schemas
from ..database import Base # To access metadata if needed directly, though conftest handles setup
from .conftest import create_test_project, create_test_agent # ADDED IMPORT
from .. import crud  # Import crud directly from backend package

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

async def test_update_project_api_generic_exception(async_client: httpx.AsyncClient, db_session: Session, fastapi_app: FastAPI):
    project = create_test_project(db_session, name="ProjectForGenericError")
    with mock.patch("backend.main.crud.update_project", side_effect=HTTPException(status_code=500, detail="CRUD generic error")):
        response = await async_client.put(f"/projects/{project.id}", json={"name": "Updated Name"})
    assert response.status_code == 500
    # For HTTPException, FastAPI returns the detail as-is
    assert response.json()["detail"] == "CRUD generic error"

async def test_project_update_value_error(async_client: httpx.AsyncClient, db_session: Session):
    # Create a project
    project = create_test_project(db_session, name="Project for Value Error")
    
    # Create another project to cause a name conflict
    other_project = create_test_project(db_session, name="Existing Project Name")
    
    # Try to update the first project with the name of the second project
    update_payload = {"name": "Existing Project Name"}
    response = await async_client.put(f"/projects/{project.id}", json=update_payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

async def test_update_project_api_http_exception(async_client: httpx.AsyncClient, db_session: Session):
    # Create a project
    project = create_test_project(db_session, name="Project for HTTP Exception")
    
    # Mock crud.update_project to raise an HTTPException
    with mock.patch("backend.main.crud.update_project", side_effect=HTTPException(status_code=418, detail="I'm a teapot")):
        response = await async_client.put(f"/projects/{project.id}", json={"name": "Updated Name"})
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

async def test_update_agent_api_generic_exception(async_client: httpx.AsyncClient, db_session: Session, fastapi_app: FastAPI):
    agent = create_test_agent(db_session, name="AgentForGenericError")
    with mock.patch("backend.main.crud.update_agent", side_effect=HTTPException(status_code=500, detail="CRUD generic error")):
        response = await async_client.put(f"/agents/{agent.id}", json={"name": "Updated Agent Name"}) # Assuming agent_id is used in path
    assert response.status_code == 500
    # For HTTPException, FastAPI returns the detail as-is
    assert response.json()["detail"] == "CRUD generic error"
    # For now, focus on covering the raise HTTPException line

async def test_agent_update_value_error(async_client: httpx.AsyncClient, db_session: Session):
    # Create an agent
    agent = create_test_agent(db_session, name="Agent for Value Error")
    
    # Create another agent to cause a name conflict
    other_agent = create_test_agent(db_session, name="Existing Agent Name")
    
    # Try to update the first agent with the name of the second agent
    update_payload = {"name": "Existing Agent Name"}
    response = await async_client.put(f"/agents/{agent.id}", json=update_payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

async def test_update_agent_api_http_exception(async_client: httpx.AsyncClient, db_session: Session):
    # Create an agent
    agent = create_test_agent(db_session, name="Agent for HTTP Exception")
    
    # Mock crud.update_agent to raise an HTTPException
    with mock.patch("backend.main.crud.update_agent", side_effect=HTTPException(status_code=418, detail="I'm a teapot")):
        response = await async_client.put(f"/agents/{agent.id}", json={"name": "Updated Name"})
        assert response.status_code == 418
        assert response.json()["detail"] == "I'm a teapot"

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
    assert data["project"] is not None
    assert data["project"]["id"] == project_id
    # In current setup, agent is populated by backend based on agent_name
    assert data["agent"] is not None
    assert data["agent"]["id"] == agent_resp.json()["id"]

    # Test task creation with non-existent project/agent (should ideally fail, depends on CRUD logic)
    invalid_project_id_str = str(uuid.uuid4().hex) # Use a valid UUID format but non-existent
    invalid_task_payload_project = {"title": "Invalid Task", "project_id": invalid_project_id_str, "agent_name": agent_name}
    response_invalid_proj = await async_client.post("/tasks/", json=invalid_task_payload_project)
    assert response_invalid_proj.status_code == 400 # crud.create_task raises ValueError -> 400 
    
    invalid_agent_name_str = "NonExistentAgentNameForTaskAPI"
    invalid_task_payload_agent = {"title": "Invalid Task", "project_id": project_id, "agent_name": invalid_agent_name_str}
    response_invalid_agent = await async_client.post("/tasks/", json=invalid_task_payload_agent)
    assert response_invalid_agent.status_code == 400 # Or 500

async def test_get_tasks_api(async_client: httpx.AsyncClient):
    project_resp = await async_client.post("/projects/", json={"name": "Task List Project API", "description": "..."})
    project_id_filter = project_resp.json()["id"]
    agent_resp = await async_client.post("/agents/", json={"name": "Task List Agent API"})
    agent_name_filter = agent_resp.json()["name"]

    response_before = await async_client.get("/tasks/")
    assert response_before.status_code == 200 # Ensure initial fetch is OK
    tasks_before_count = len(response_before.json())

    post_t1_resp = await async_client.post("/tasks/", json={"title": "T1", "project_id": project_id_filter, "agent_name": agent_name_filter})
    assert post_t1_resp.status_code == 200

    post_t2_resp = await async_client.post("/tasks/", json={"title": "T2", "project_id": project_id_filter})
    assert post_t2_resp.status_code == 200
    
    # Task T3 needs a project_id as it's required by TaskCreate schema
    post_t3_resp = await async_client.post("/tasks/", json={"title": "T3", "project_id": project_id_filter, "agent_name": agent_name_filter})
    assert post_t3_resp.status_code == 200

    response_all_after = await async_client.get("/tasks/")
    assert response_all_after.status_code == 200
    # Now we expect exactly 3 tasks to have been successfully created
    assert len(response_all_after.json()) == tasks_before_count + 3 # Check relative increase

    # Test filtering by project_id
    response_proj_filter = await async_client.get(f"/tasks/?project_id={project_id_filter}")
    assert response_proj_filter.status_code == 200
    tasks_for_project = [t for t in response_proj_filter.json() if t["project"] and t["project"]["id"] == project_id_filter]
    assert len(tasks_for_project) == 3  # All tasks belong to this project

    # Test filtering by agent_name
    response_agent_filter = await async_client.get(f"/tasks/?agent_name={agent_name_filter}")
    assert response_agent_filter.status_code == 200
    tasks_for_agent = [t for t in response_agent_filter.json() if t["agent"] and t["agent"]["name"] == agent_name_filter]
    assert len(tasks_for_agent) == 2  # Only T1 and T3 have this agent

    # Test filtering by both project_id and agent_name
    response_combined_filter = await async_client.get(f"/tasks/?project_id={project_id_filter}&agent_name={agent_name_filter}")
    assert response_combined_filter.status_code == 200
    tasks_combined = response_combined_filter.json()
    
    # Verify tasks match both filters
    filtered_tasks = [
        t for t in tasks_combined 
        if t["project"] and t["project"]["id"] == project_id_filter 
        and t["agent"] and t["agent"]["name"] == agent_name_filter
    ]
    assert len(filtered_tasks) == 2  # Only T1 and T3 match both filters
    
    # Verify task details in combined filter
    task_titles = {t["title"] for t in filtered_tasks}
    assert "T1" in task_titles
    assert "T3" in task_titles
    assert "T2" not in task_titles  # T2 doesn't have an agent

    # Test filtering with non-existent values
    non_existent_project_id = str(uuid.uuid4())
    response_invalid_project = await async_client.get(f"/tasks/?project_id={non_existent_project_id}")
    assert response_invalid_project.status_code == 200
    assert len(response_invalid_project.json()) == 0

    non_existent_agent = "NonExistentAgent"
    response_invalid_agent = await async_client.get(f"/tasks/?agent_name={non_existent_agent}")
    assert response_invalid_agent.status_code == 200
    assert len(response_invalid_agent.json()) == 0

async def test_get_task_by_id_api(async_client: httpx.AsyncClient):
    project_resp = await async_client.post("/projects/", json={"name": "Task By ID Proj API", "description": "..."})
    project_id = project_resp.json()["id"]
    task_payload = {"title": "API Task By ID", "project_id": project_id}
    create_response = await async_client.post("/tasks/", json=task_payload)
    assert create_response.status_code == 200 # Ensure task creation was successful
    task_id = create_response.json()["id"]

    response = await async_client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "API Task By ID"
    if data.get("project"):
        assert data["project"]["id"] == project_id

    response_not_found = await async_client.get(f"/tasks/{task_id + "_not_found"}")
    assert response_not_found.status_code == 404

async def test_update_task_api(async_client: httpx.AsyncClient):
    project_resp = await async_client.post("/projects/", json={"name": "TaskUpdate Proj API", "description": "..."})
    project_id_orig = project_resp.json()["id"]
    
    task_payload_orig = {"title": "Original Task Title for Update", "project_id": project_id_orig, "completed": False}
    create_response = await async_client.post("/tasks/", json=task_payload_orig)
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    # Create another project to test changing project_id
    project_resp_new = await async_client.post("/projects/", json={"name": "TaskUpdate New Proj API", "description": "..."})
    project_id_new = project_resp_new.json()["id"]
    
    # Create an agent to test linking agent_id
    agent_resp = await async_client.post("/agents/", json={"name": "TaskUpdate Agent API"})
    agent_id_new = agent_resp.json()["id"]

    task_payload_update = {
        "title": "Updated Task Title API", 
        "description": "Updated Task Desc API", 
        "completed": True,
        "project_id": project_id_new, # Change project
        "agent_id": agent_id_new # Add agent
    }
    response = await async_client.put(f"/tasks/{task_id}", json=task_payload_update)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task Title API"
    assert data["description"] == "Updated Task Desc API"
    assert data["completed"] is True
    assert data["project"]["id"] == project_id_new # Verify project change
    assert data["agent"]["id"] == agent_id_new # Verify agent linked
    
    # Test updating a non-existent task
    response_not_found = await async_client.put(f"/tasks/{task_id + "_not_found"}", json=task_payload_update)
    assert response_not_found.status_code == 404

async def test_delete_task_api(async_client: httpx.AsyncClient):
    proj_resp = await async_client.post("/projects/", json={"name": "TaskDelete Proj"})
    task_payload = {"title": "Task to Delete API", "project_id": proj_resp.json()["id"]}
    create_response = await async_client.post("/tasks/", json=task_payload)
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    delete_response = await async_client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 200
    # assert delete_response.json()["id"] == task_id

    get_response = await async_client.get(f"/tasks/{task_id}")
    assert get_response.status_code == 404

    delete_not_found = await async_client.delete(f"/tasks/{task_id + "_not_found"}") # MODIFIED
    assert delete_not_found.status_code == 404

async def test_task_update_value_error(async_client: httpx.AsyncClient, db_session: Session):
    # Create a project and task
    project = create_test_project(db_session, name="Project for Task Value Error")
    task = crud.create_task(db_session, schemas.TaskCreate(title="Task for Value Error", project_id=project.id))
    
    # Try to update the task with a non-existent project_id
    non_existent_project_id = str(uuid.uuid4())
    update_payload = {"project_id": non_existent_project_id}
    response = await async_client.put(f"/tasks/{task.id}", json=update_payload)
    
    assert response.status_code == 400
    assert "not found" in response.json()["detail"]

# --- Task Sub-task API Tests ---
# async def test_create_task_with_parent_api(async_client: httpx.AsyncClient):
#     # Create a potential parent task first
#     parent_payload = {"title": "Overall Project Task"}
#     parent_resp = await async_client.post("/tasks/", json=parent_payload)
#     assert parent_resp.status_code == 200
#     parent_task_id = parent_resp.json()["id"]
# 
#     # Now create a task that identifies this as its parent
#     # NOTE: The current TaskCreate schema in schemas.py might not have parent_task_id
#     # This test assumes it does, or that the endpoint logic handles it gracefully.
#     # If schemas.TaskCreate needs parent_task_id, it should be added there.
#     # For now, let's assume the endpoint allows it in the payload and crud.create_task handles it.
#     child_payload = {"title": "Phase 1 Task", "parent_task_id": parent_task_id}
#     child_resp = await async_client.post("/tasks/", json=child_payload)
#     assert child_resp.status_code == 200
#     child_data = child_resp.json()
#     assert child_data["title"] == "Phase 1 Task"
#     # This assertion depends on how parent_task_id is stored and returned by your Task model/schema
#     # If Task schema has a parent_id or similar, assert it here.
#     # For now, we'll assume the creation was successful if it returns 200 and basic data matches.
#     # The actual parent_task_id linkage might be implicitly stored in DB but not directly in response's top level.
#     # The GET /tasks/{id} should ideally show the parent_task_id if it's an attribute.
# 
# 
# async def test_create_task_with_invalid_parent_api(async_client: httpx.AsyncClient):
#     invalid_parent_id = "non-existent-parent-uuid"
#     payload = {"title": "Task with Invalid Parent", "parent_task_id": invalid_parent_id}
#     response = await async_client.post("/tasks/", json=payload)
#     assert response.status_code == 400 # Expecting error due to invalid parent_task_id
# 
# 
# async def test_get_tasks_with_parent_id_filter_api(async_client: httpx.AsyncClient):
#     # Create a parent and two children
#     parent_task_resp = await async_client.post("/tasks/", json={"title": "Parent for Filtering"})
#     parent_task_id = parent_task_resp.json()["id"]
# 
#     await async_client.post("/tasks/", json={"title": "Child 1 of Filtering Parent", "parent_task_id": parent_task_id})
#     await async_client.post("/tasks/", json={"title": "Child 2 of Filtering Parent", "parent_task_id": parent_task_id})
#     
#     # Create another unrelated task
#     await async_client.post("/tasks/", json={"title": "Unrelated Task for Filtering Test"})
# 
#     # Fetch tasks filtered by parent_id
#     # NOTE: This assumes GET /tasks/ supports a query parameter like `parent_id` or `parent_task_id`
#     # If not, this endpoint needs to be updated or this test modified.
#     # For now, assuming it would be `parent_task_id` to match the model field.
#     # The current GET /tasks/ in main.py does NOT have a parent_task_id filter.
#     # This test will likely fail or need adjustment for the actual filtering mechanism.
#     # SKIPPING THIS ASSERTION FOR NOW as the endpoint doesn't support it yet.
#     # response = await async_client.get(f"/tasks/?parent_task_id={parent_task_id}")
#     # assert response.status_code == 200
#     # filtered_tasks = response.json()
#     # assert len(filtered_tasks) == 2
#     # titles = {t["title"] for t in filtered_tasks}
#     # assert "Child 1 of Filtering Parent" in titles
#     # assert "Child 2 of Filtering Parent" in titles
#     pass # Placeholder until GET /tasks/ filtering by parent_task_id is confirmed/implemented
# 
# 
# async def test_update_task_parent_api(async_client: httpx.AsyncClient):
#     # Create two tasks
#     task1_resp = await async_client.post("/tasks/", json={"title": "Initial Parent Task"})
#     task1_id = task1_resp.json()["id"]
#     task2_resp = await async_client.post("/tasks/", json={"title": "Task to become child"})
#     task2_id = task2_resp.json()["id"]
# 
#     # Update task2 to set task1 as its parent
#     # This requires schemas.TaskUpdate to support `parent_task_id`
#     update_payload = {"parent_task_id": task1_id} 
#     response = await async_client.put(f"/tasks/{task2_id}", json=update_payload)
#     assert response.status_code == 200
#     # Add assertions here based on what PUT /tasks/{id} returns regarding parent_task_id
#     # e.g., assert response.json().get("parent_task_id") == task1_id
# 
#     # Test updating to a non-existent parent
#     invalid_parent_update = {"parent_task_id": "non-existent-parent-for-update"}
#     response_invalid = await async_client.put(f"/tasks/{task2_id}", json=invalid_parent_update)
#     assert response_invalid.status_code == 400 # Assuming CRUD handles this


# --- Subtask API Tests (New specific tests for subtask endpoints) ---
async def test_create_subtask_for_parent_api(async_client: httpx.AsyncClient):
    # 1. Create a parent project (optional, but good for context if tasks are project-linked)
    project_resp = await async_client.post("/projects/", json={"name": "Subtask Parent Project", "description": "Project for subtask testing"})
    assert project_resp.status_code == 200
    project_id = project_resp.json()["id"]

    # 2. Create the parent task
    parent_task_payload = {"title": "Parent Task for Subtasks", "project_id": project_id}
    parent_task_resp = await async_client.post("/tasks/", json=parent_task_payload)
    assert parent_task_resp.status_code == 200
    parent_task_id = parent_task_resp.json()["id"]

    # 3. Create a subtask for this parent
    subtask_payload = {"title": "My First Subtask", "description": "A detailed subtask"}
    response = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json=subtask_payload)
    assert response.status_code == 200 # Assuming 200 for successful POST
    data = response.json()
    assert data["title"] == "My First Subtask"
    assert data["description"] == "A detailed subtask"
    assert data["id"] is not None
    assert data["task_id"] == parent_task_id # Crucial: links back to parent
    assert data["completed"] is False # Default or as specified

    # 4. Attempt to create a subtask for a non-existent parent
    non_existent_parent_id = "non-existent-uuid" # Made clearly non-existent
    response_invalid_parent = await async_client.post(f"/tasks/{non_existent_parent_id}/subtasks/", json=subtask_payload)
    # crud.create_subtask checks if parent_task exists and raises ValueError, which main.py maps to 400
    assert response_invalid_parent.status_code == 400 

async def test_list_subtasks_for_parent_api(async_client: httpx.AsyncClient):
    # 1. Create parent project and task
    project_resp = await async_client.post("/projects/", json={"name": "List Subtasks Parent Project", "description": "Project for listing subtasks"})
    assert project_resp.status_code == 200
    project_id = project_resp.json()["id"]
    parent_task_payload = {"title": "Parent for Listing Subtasks", "project_id": project_id}
    parent_task_resp = await async_client.post("/tasks/", json=parent_task_payload)
    assert parent_task_resp.status_code == 200
    parent_task_id = parent_task_resp.json()["id"]

    # 2. Create multiple subtasks for this parent
    subtask1_resp = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json={"title": "Subtask Alpha"})
    assert subtask1_resp.status_code == 200
    subtask2_resp = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json={"title": "Subtask Beta"})
    assert subtask2_resp.status_code == 200
    subtask_gamma_resp = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json={"title": "Subtask Gamma", "completed": True})
    assert subtask_gamma_resp.status_code == 200
    subtask_gamma_id = subtask_gamma_resp.json()["id"]


    # 3. List subtasks for the parent
    response = await async_client.get(f"/tasks/{parent_task_id}/subtasks")
    assert response.status_code == 200
    subtasks_data = response.json()
    assert len(subtasks_data) == 3
    
    titles = {s["title"] for s in subtasks_data}
    assert "Subtask Alpha" in titles
    assert "Subtask Beta" in titles
    assert "Subtask Gamma" in titles

    gamma_task_data = next((s for s in subtasks_data if s["id"] == subtask_gamma_id), None)
    assert gamma_task_data is not None
    assert gamma_task_data["completed"] is True


    # 4. Verify that getting the parent task also includes these subtasks in its response
    parent_task_details_resp = await async_client.get(f"/tasks/{parent_task_id}")
    assert parent_task_details_resp.status_code == 200
    parent_task_data = parent_task_details_resp.json()
    assert "subtasks" in parent_task_data
    assert isinstance(parent_task_data["subtasks"], list)
    assert len(parent_task_data["subtasks"]) == 3 # Check count from parent task's perspective
    
    parent_subtask_titles = {s["title"] for s in parent_task_data["subtasks"]}
    assert "Subtask Alpha" in parent_subtask_titles
    assert "Subtask Beta" in parent_subtask_titles
    assert "Subtask Gamma" in parent_subtask_titles
    
    # 5. Attempt to list subtasks for a non-existent parent
    non_existent_parent_id = "non-existent-uuid-for-list"
    response_invalid_parent_list = await async_client.get(f"/tasks/{non_existent_parent_id}/subtasks")
    assert response_invalid_parent_list.status_code == 404 # Expecting 404 as parent task won't be found via crud.get_task


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

async def test_get_subtask_by_id_api(async_client: httpx.AsyncClient):
    # 1. Create parent project and task
    project_resp = await async_client.post("/projects/", json={"name": "Get Subtask Parent Project"})
    project_id = project_resp.json()["id"]
    parent_task_resp = await async_client.post("/tasks/", json={"title": "Parent for Get Subtask", "project_id": project_id})
    parent_task_id = parent_task_resp.json()["id"]

    # 2. Create a subtask
    subtask_create_resp = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json={"title": "Subtask to Get", "description": "Details..."})
    assert subtask_create_resp.status_code == 200
    subtask_id = subtask_create_resp.json()["id"]

    # 3. Get the subtask by its ID
    response = await async_client.get(f"/subtasks/{subtask_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == subtask_id
    assert data["title"] == "Subtask to Get"
    assert data["description"] == "Details..."
    assert data["task_id"] == parent_task_id

    # 4. Attempt to get a non-existent subtask
    response_not_found = await async_client.get(f"/subtasks/non-existent-subtask-id")
    assert response_not_found.status_code == 404

async def test_update_subtask_api(async_client: httpx.AsyncClient):
    # 1. Create parent project and task
    project_resp = await async_client.post("/projects/", json={"name": "Update Subtask Parent Project"})
    project_id = project_resp.json()["id"]
    parent_task_resp = await async_client.post("/tasks/", json={"title": "Parent for Update Subtask", "project_id": project_id})
    parent_task_id = parent_task_resp.json()["id"]

    # 2. Create a subtask
    subtask_create_resp = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json={"title": "Subtask to Update", "description": "Initial Desc"})
    assert subtask_create_resp.status_code == 200
    subtask_id = subtask_create_resp.json()["id"]

    # 3. Update the subtask
    update_payload = {"title": "Updated Subtask Title", "description": "Updated Description", "completed": True}
    response = await async_client.put(f"/subtasks/{subtask_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == subtask_id
    assert data["title"] == "Updated Subtask Title"
    assert data["description"] == "Updated Description"
    assert data["completed"] is True
    assert data["task_id"] == parent_task_id

    # 4. Attempt to update a non-existent subtask
    response_not_found = await async_client.put(f"/subtasks/non-existent-subtask-id-for-update", json=update_payload)
    assert response_not_found.status_code == 404

async def test_delete_subtask_api(async_client: httpx.AsyncClient):
    # 1. Create parent project and task
    project_resp = await async_client.post("/projects/", json={"name": "Delete Subtask Parent Project"})
    project_id = project_resp.json()["id"]
    parent_task_resp = await async_client.post("/tasks/", json={"title": "Parent for Delete Subtask", "project_id": project_id})
    parent_task_id = parent_task_resp.json()["id"]

    # 2. Create a subtask
    subtask_create_resp = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json={"title": "Subtask to Delete"})
    assert subtask_create_resp.status_code == 200
    subtask_id = subtask_create_resp.json()["id"]
    original_subtask_data = subtask_create_resp.json() # Save for comparison

    # 3. Delete the subtask
    delete_response = await async_client.delete(f"/subtasks/{subtask_id}")
    assert delete_response.status_code == 200
    # Ensure the returned object from delete is the one that was deleted
    deleted_data = delete_response.json()
    assert deleted_data["id"] == subtask_id
    assert deleted_data["title"] == original_subtask_data["title"] 


    # 4. Verify the subtask is gone
    get_response_after_delete = await async_client.get(f"/subtasks/{subtask_id}")
    assert get_response_after_delete.status_code == 404

    # 5. Attempt to delete a non-existent subtask
    response_not_found = await async_client.delete(f"/subtasks/non-existent-subtask-id-for-delete")
    assert response_not_found.status_code == 404

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
    with mock.patch('backend.crud.create_task', side_effect=Exception("DB commit failed unexpectedly")):
        response = await async_client.post("/tasks/", json=task_payload)
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"]
        assert "DB commit failed unexpectedly" in response.json()["detail"]

async def test_update_task_api_generic_exception(async_client: httpx.AsyncClient):
    # Create a project and task to update
    project_resp = await async_client.post("/projects/", json={"name": "Project for Task Update Exc"})
    project_id = project_resp.json()["id"]
    task_resp = await async_client.post("/tasks/", json={"title": "Task for Update Exc", "project_id": project_id})
    task_id = task_resp.json()["id"]
    update_payload = {"title": "Updated Title during Exc Test"}

    with mock.patch('backend.crud.update_task', side_effect=Exception("Update DB failed")):
        response = await async_client.put(f"/tasks/{task_id}", json=update_payload)
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"]
        assert "Update DB failed" in response.json()["detail"]

async def test_delete_task_api_generic_exception(async_client: httpx.AsyncClient, db_session: Session):
    # Create a project and task to delete
    project_resp = await async_client.post("/projects/", json={"name": "Project for Delete Exc"})
    project_id = project_resp.json()["id"]
    task_resp = await async_client.post("/tasks/", json={"title": "Task for Delete Exc", "project_id": project_id})
    task_id = task_resp.json()["id"]

    with mock.patch('backend.crud.delete_task', side_effect=Exception("Delete DB failed")):
        response = await async_client.delete(f"/tasks/{task_id}")
    
    assert response.status_code == 500
    assert response.json()["detail"] == "Internal server error during task deletion: Something went wrong"

async def test_create_subtask_api_generic_exception(async_client: httpx.AsyncClient):
    # Create a parent task
    project_resp = await async_client.post("/projects/", json={"name": "Project for Subtask Exc"})
    project_id = project_resp.json()["id"]
    parent_task_resp = await async_client.post("/tasks/", json={"title": "Parent for Subtask Exc", "project_id": project_id})
    parent_task_id = parent_task_resp.json()["id"]
    subtask_payload = {"title": "Subtask Causing Exc"}

    with mock.patch('backend.crud.create_subtask', side_effect=Exception("Subtask DB failed")):
        response = await async_client.post(f"/tasks/{parent_task_id}/subtasks/", json=subtask_payload)
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"]
        assert "Subtask DB failed" in response.json()["detail"]

async def add_dummy_routes_for_coverage(app: FastAPI):
    # Adds dummy routes to the app for coverage.
    @app.get("/dummy_coverage_route_empty_path_generated_name/", name=None, operation_id=None)
    async def dummy_route_empty_name():
        return {"message": "dummy for empty name"}

    @app.get("/dummy_route_desc_only", name=None, operation_id=None, summary=None, description="This is a description.\\nSecond line.")
    async def dummy_route_desc_only():
        return {"message": "dummy for desc only"}

    @app.get("/dummy_route_no_summary_no_desc", name=None, operation_id=None, summary=None, description=None)
    async def dummy_route_no_summary_no_desc():
        return {"message": "dummy for no summary no desc"}
    
    @app.get("/{}", name="", operation_id="") # Path becomes empty, name & op_id are empty strings
    async def dummy_route_path_becomes_empty_for_unnamed_route(): # Function name doesn't matter here for tool_name
        return {"message": "dummy for path becomes empty for unnamed"}

async def remove_dummy_routes_for_coverage(app: FastAPI, original_routes: list):
    # Restores the original routes of the app.
    app.router.routes.clear()
    app.router.routes.extend(original_routes)

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
    # Test the lifespan context manager
    from backend.main import app_lifespan
    import sys
    from io import StringIO

    # Capture stdout to check print statements
    stdout = StringIO()
    sys.stdout = stdout

    try:
        async with app_lifespan(fastapi_app):
            pass  # Let the context manager do its thing
        
        output = stdout.getvalue()
        assert "[LIFESPAN] Application startup..." in output
        assert "[LIFESPAN] Application shutdown..." in output
    finally:
        sys.stdout = sys.__stdout__  # Restore stdout

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

async def test_project_agent_task_generic_exceptions(async_client: httpx.AsyncClient, db_session: Session, fastapi_app: FastAPI):
    # Create test data
    project = create_test_project(db_session, name="GenericErrorTest")
    agent = create_test_agent(db_session, name="GenericErrorAgent")
    task = crud.create_task(db_session, schemas.TaskCreate(title="GenericErrorTask", project_id=project.id))

    # Test project update generic exception
    with mock.patch("backend.main.crud.update_project", side_effect=Exception("Generic project error")):
        response = await async_client.put(f"/projects/{project.id}", json={"name": "Updated Name"})
        assert response.status_code == 500
        assert response.json()["detail"] == "Internal server error: Generic project error"

    # Test agent update generic exception
    with mock.patch("backend.main.crud.update_agent", side_effect=Exception("Generic agent error")):
        response = await async_client.put(f"/agents/{agent.id}", json={"name": "Updated Name"})
        assert response.status_code == 500
        assert response.json()["detail"] == "Internal server error: Generic agent error"

    # Test task update generic exception
    with mock.patch("backend.main.crud.update_task", side_effect=Exception("Generic task error")):
        response = await async_client.put(f"/tasks/{task.id}", json={"title": "Updated Title"})
        assert response.status_code == 500
        assert response.json()["detail"] == "Internal server error: Generic task error"

async def test_get_mcp_docs_api_edge_cases_complete(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    """Test edge cases in get_mcp_docs endpoint with complete coverage"""
    # Add test routes with various edge cases
    @fastapi_app.get("/test-no-methods")
    async def route_no_methods():
        pass

    @fastapi_app.get("/test-no-path", name=None)
    async def route_no_path():
        pass

    @fastapi_app.get("/test-no-name-no-desc", name=None, description=None)
    async def route_no_name_no_desc():
        pass

    @fastapi_app.get("/test-empty-name", name="")
    async def route_empty_name():
        pass

    @fastapi_app.get("/test-empty-desc", description="")
    async def route_empty_desc():
        pass

    # Add a route with a path that will become empty after processing
    @fastapi_app.get("/{}", name="", operation_id="")
    async def empty_path_route():
        pass

    # Add a route with a description that has multiple lines
    @fastapi_app.get("/test-multiline-desc", description="First line\nSecond line")
    async def route_multiline_desc():
        pass

    # Add a route with no operation_id but with a name
    @fastapi_app.get("/test-no-op-id", name="test_name", operation_id=None)
    async def route_no_op_id():
        pass

    # Store original routes
    original_routes = list(fastapi_app.router.routes)

    try:
        # Make the request
        response = await async_client.get("/mcp-docs")
        assert response.status_code == 200
        data = response.json()

        # Verify the documentation was generated correctly
        assert "mcp_project_manager_tools_documentation" in data
        assert "# MCP Project Manager Tools Documentation" in data["mcp_project_manager_tools_documentation"]

        # Verify edge cases are handled
        doc_content = data["mcp_project_manager_tools_documentation"]
        assert "test-no-methods" in doc_content
        assert "test-no-path" in doc_content
        assert "test-no-name-no-desc" in doc_content
        assert "test-empty-name" in doc_content
        assert "test-empty-desc" in doc_content
        assert "unnamed_route" in doc_content
        assert "First line" in doc_content  # First line of multiline description
        assert "test_name" in doc_content  # Name used when operation_id is None

    finally:
        # Restore original routes
        fastapi_app.router.routes.clear()
        fastapi_app.router.routes.extend(original_routes)

async def test_get_mcp_docs_api_tools_dict_edge_cases(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    """Test edge cases with MCP tools dictionary"""
    # Create a mock MCP instance with various edge cases in tools dict
    mock_mcp_instance = mock.MagicMock()
    mock_mcp_instance.tools = {
        "tool1": {"description": "Test tool"},
        "tool2": {},  # No description
        "tool3": None,  # Invalid tool info
        "tool4": {"description": None},  # None description
        "tool5": {"description": ""},  # Empty description
    }

    # Store original state
    original_app_state_mcp_exists = hasattr(fastapi_app.state, 'mcp_instance')
    original_app_state_mcp_value = getattr(fastapi_app.state, 'mcp_instance', None)
    original_routes = list(fastapi_app.router.routes)

    try:
        # Set up the mock MCP instance
        fastapi_app.state.mcp_instance = mock_mcp_instance

        # Keep only the /mcp-docs route
        mcp_docs_route = next((r for r in original_routes if hasattr(r, "path") and r.path == "/mcp-docs"), None)
        fastapi_app.router.routes.clear()
        if mcp_docs_route:
            fastapi_app.router.routes.append(mcp_docs_route)

        # Make the request
        response = await async_client.get("/mcp-docs")
        assert response.status_code == 200
        data = response.json()

        # Verify the response
        docs_md = data["mcp_project_manager_tools_documentation"]
        assert "Test tool" in docs_md  # Normal case
        assert "Tool information not available" in docs_md  # For tools without proper info

    finally:
        # Restore original state
        if original_app_state_mcp_exists:
            fastapi_app.state.mcp_instance = original_app_state_mcp_value
        elif hasattr(fastapi_app.state, 'mcp_instance'):
            delattr(fastapi_app.state, 'mcp_instance')
        fastapi_app.router.routes.clear()
        fastapi_app.router.routes.extend(original_routes)

async def test_get_mcp_docs_api_invalid_mcp_instance(async_client: httpx.AsyncClient, fastapi_app: FastAPI):
    """Test handling of invalid MCP instance"""
    # Create a mock MCP instance that raises an exception when accessed
    class BrokenMCPInstance:
        @property
        def tools(self):
            raise Exception("MCP instance error")

    mock_mcp_instance = BrokenMCPInstance()

    # Store original state
    original_app_state_mcp_exists = hasattr(fastapi_app.state, 'mcp_instance')
    original_app_state_mcp_value = getattr(fastapi_app.state, 'mcp_instance', None)
    original_routes = list(fastapi_app.router.routes)

    try:
        # Set up the mock MCP instance
        fastapi_app.state.mcp_instance = mock_mcp_instance

        # Make the request
        response = await async_client.get("/mcp-docs")
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
        assert "MCP instance error" in data["detail"]

    finally:
        # Restore original state
        if original_app_state_mcp_exists:
            fastapi_app.state.mcp_instance = original_app_state_mcp_value
        elif hasattr(fastapi_app.state, 'mcp_instance'):
            delattr(fastapi_app.state, 'mcp_instance')
        
        # Restore original routes
        fastapi_app.router.routes.clear()
        fastapi_app.router.routes.extend(original_routes)