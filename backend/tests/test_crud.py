# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:40:00Z

import pytest
from sqlalchemy.orm import Session

# Adjust imports based on project structure
from .. import crud, models, schemas # Assuming crud, models, schemas are in the parent directory

# Helper function to create a project for testing other entities
def create_test_project(db: Session, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(name=name, description="A test project")
    return crud.create_project(db=db, project=project_schema)

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud.create_agent(db=db, agent=agent_schema)


# --- Project CRUD Tests ---
def test_create_and_get_project(db_session: Session):
    project_schema = schemas.ProjectCreate(name="Test Project Alpha", description="Alpha Test Description")
    db_project = crud.create_project(db=db_session, project=project_schema)
    assert db_project is not None
    assert db_project.name == "Test Project Alpha"
    assert db_project.description == "Alpha Test Description"
    assert db_project.id is not None

    retrieved_project = crud.get_project(db=db_session, project_id=db_project.id)
    assert retrieved_project is not None
    assert retrieved_project.id == db_project.id
    assert retrieved_project.name == "Test Project Alpha"

    retrieved_by_name = crud.get_project_by_name(db=db_session, name="Test Project Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_project.id

def test_get_project_not_found(db_session: Session):
    retrieved_project = crud.get_project(db=db_session, project_id=9999)
    assert retrieved_project is None
    retrieved_by_name = crud.get_project_by_name(db=db_session, name="NonExistentProject")
    assert retrieved_by_name is None

def test_get_projects(db_session: Session):
    projects_before = crud.get_projects(db=db_session)
    create_test_project(db_session, name="Project List Test 1")
    create_test_project(db_session, name="Project List Test 2")
    projects_after = crud.get_projects(db=db_session)
    assert len(projects_after) == len(projects_before) + 2

def test_update_project(db_session: Session):
    project = create_test_project(db_session, name="Original Project Name")
    update_data = schemas.ProjectUpdate(name="Updated Project Name", description="Updated Desc")
    updated_project = crud.update_project(db=db_session, project_id=project.id, project_update=update_data)
    assert updated_project is not None
    assert updated_project.name == "Updated Project Name"
    assert updated_project.description == "Updated Desc"

    # Test updating non-existent project
    non_existent_update = crud.update_project(db=db_session, project_id=999, project_update=update_data)
    assert non_existent_update is None

def test_delete_project(db_session: Session):
    project = create_test_project(db_session, name="To Be Deleted")
    project_id = project.id
    deleted_project = crud.delete_project(db=db_session, project_id=project_id)
    assert deleted_project is not None
    assert deleted_project.id == project_id
    assert crud.get_project(db=db_session, project_id=project_id) is None

    # Test deleting non-existent project
    non_existent_delete = crud.delete_project(db=db_session, project_id=999)
    assert non_existent_delete is None

# --- Agent CRUD Tests ---
def test_create_and_get_agent(db_session: Session):
    agent_schema = schemas.AgentCreate(name="Test Agent Alpha")
    db_agent = crud.create_agent(db=db_session, agent=agent_schema)
    assert db_agent is not None
    assert db_agent.name == "Test Agent Alpha"
    assert db_agent.id is not None

    retrieved_agent = crud.get_agent(db=db_session, agent_id=db_agent.id)
    assert retrieved_agent is not None
    assert retrieved_agent.id == db_agent.id

    retrieved_by_name = crud.get_agent_by_name(db=db_session, name="Test Agent Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_agent.id

def test_get_agent_not_found(db_session: Session):
    assert crud.get_agent(db=db_session, agent_id=8888) is None
    assert crud.get_agent_by_name(db=db_session, name="NonExistentAgent") is None

def test_get_agents(db_session: Session):
    agents_before = crud.get_agents(db=db_session)
    create_test_agent(db_session, name="Agent List Test 1")
    create_test_agent(db_session, name="Agent List Test 2")
    agents_after = crud.get_agents(db=db_session)
    assert len(agents_after) == len(agents_before) + 2

def test_update_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Original Agent Name")
    update_data = schemas.AgentUpdate(name="Updated Agent Name")
    updated_agent = crud.update_agent(db=db_session, agent_id=agent.id, agent_update=update_data)
    assert updated_agent is not None
    assert updated_agent.name == "Updated Agent Name"

def test_delete_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Agent To Delete")
    agent_id = agent.id
    deleted_agent = crud.delete_agent(db=db_session, agent_id=agent_id)
    assert deleted_agent is not None
    assert deleted_agent.id == agent_id
    assert crud.get_agent(db=db_session, agent_id=agent_id) is None


# --- Task CRUD Tests ---
def test_create_and_get_task(db_session: Session):
    project = create_test_project(db_session)
    agent = create_test_agent(db_session)

    task_schema = schemas.TaskCreate(
        title="Test Task Alpha", 
        description="Task Alpha Description",
        project_id=project.id,
        agent_name=agent.name
    )
    db_task = crud.create_task(db=db_session, task=task_schema)
    assert db_task is not None
    assert db_task.title == "Test Task Alpha"
    assert db_task.project_id == project.id
    assert db_task.agent_id == agent.id # create_task resolves agent_name to agent_id
    assert db_task.id is not None

    retrieved_task = crud.get_task(db=db_session, task_id=db_task.id)
    assert retrieved_task is not None
    assert retrieved_task.id == db_task.id

def test_get_task_not_found(db_session: Session):
    assert crud.get_task(db=db_session, task_id=7777) is None

def test_get_tasks_with_filtering(db_session: Session):
    project1 = create_test_project(db_session, name="Filter Project 1")
    project2 = create_test_project(db_session, name="Filter Project 2")
    agent1 = create_test_agent(db_session, name="Filter Agent 1")
    agent2 = create_test_agent(db_session, name="Filter Agent 2")

    crud.create_task(db_session, schemas.TaskCreate(title="P1A1 Task", project_id=project1.id, agent_name=agent1.name))
    crud.create_task(db_session, schemas.TaskCreate(title="P1A2 Task", project_id=project1.id, agent_name=agent2.name))
    crud.create_task(db_session, schemas.TaskCreate(title="P2A1 Task", project_id=project2.id, agent_name=agent1.name))

    # Test filtering by project_id
    p1_tasks = crud.get_tasks(db_session, project_id=project1.id)
    assert len(p1_tasks) == 2
    for task in p1_tasks: assert task.project_id == project1.id

    # Test filtering by agent_name (which translates to agent_id in crud.get_tasks)
    a1_tasks = crud.get_tasks(db_session, agent_name=agent1.name)
    assert len(a1_tasks) == 2
    for task in a1_tasks: assert task.agent_id == agent1.id
    
    # Test filtering by both
    p1a2_tasks = crud.get_tasks(db_session, project_id=project1.id, agent_name=agent2.name)
    assert len(p1a2_tasks) == 1
    assert p1a2_tasks[0].project_id == project1.id
    assert p1a2_tasks[0].agent_id == agent2.id

    # Test get all (or with limit)
    all_tasks = crud.get_tasks(db_session, limit=10)
    assert len(all_tasks) >= 3 # Could be more if other tests created tasks

def test_update_task(db_session: Session):
    project = create_test_project(db_session)
    agent = create_test_agent(db_session)
    task = crud.create_task(db_session, schemas.TaskCreate(title="Original Task Title", project_id=project.id, agent_name=agent.name))
    
    update_data = schemas.TaskUpdate(
        title="Updated Task Title", 
        description="Updated Desc", 
        completed=True,
        project_id=project.id, # Can also test changing project/agent later
        agent_name=agent.name
    )
    updated_task = crud.update_task(db=db_session, task_id=task.id, task_update=update_data)
    assert updated_task is not None
    assert updated_task.title == "Updated Task Title"
    assert updated_task.description == "Updated Desc"
    assert updated_task.completed is True

def test_delete_task(db_session: Session):
    project = create_test_project(db_session)
    agent = create_test_agent(db_session)
    task = crud.create_task(db_session, schemas.TaskCreate(title="Task To Delete", project_id=project.id, agent_name=agent.name))
    task_id = task.id

    deleted_task = crud.delete_task(db=db_session, task_id=task_id)
    assert deleted_task is not None
    assert deleted_task.id == task_id
    assert crud.get_task(db=db_session, task_id=task_id) is None 