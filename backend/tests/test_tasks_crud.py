# Project: project-manager

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock # Ensure mock is imported

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects # Added
from backend.crud import tasks as crud_tasks # Added
from backend.crud import agents as crud_agents # Added

# Helper function to create a project for testing other entities
def create_test_project(db: Session, name="Test Project") -> models.Project:
    # Directly create and add model instance for helper
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    db_project = models.Project(
        id=str(uuid.uuid4()),
        name=project_schema.name,
        description=project_schema.description
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    # Directly create and add model instance for helper
    agent_schema = schemas.AgentCreate(name=name)
    db_agent = models.Agent(
        id=str(uuid.uuid4()),
        name=agent_schema.name
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

# --- Task CRUD Tests ---
# Note: These tests focus on the Task CRUD functions, so setup should create
# related entities (Project, Agent) directly via models and session.

def test_create_and_get_task(db_session: Session):
    # Setup: Directly create related models for this test
    project = models.Project(id=str(uuid.uuid4()), name="Test Project", description="...")
    agent = models.Agent(id=str(uuid.uuid4()), name="Test Agent")
    db_session.add(project)
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(project)
    db_session.refresh(agent)

    task_schema = schemas.TaskCreate(
        title="Test Task Alpha",
        description="Task Alpha Description",
        project_id=str(project.id),
        agent_id=str(agent.id) # Use agent_id, not agent_name based on Task model
    )
    
    # Test the create_task CRUD function
    # The create_task function in crud.py handles assigning the task_number
    # Ensure project_id is passed correctly
    db_task = crud_tasks.create_task(
        db_session, project_id=project.id, task=task_schema, agent_id=agent.id)
    assert db_task is not None
    assert db_task.title == task_schema.title
    # Ensure comparison is type-safe and matches the model/schema
    assert str(db_task.project_id) == str(project.id)
    # Check agent relationship is loaded and correct agent is linked
    assert db_task.agent is not None  
    assert db_task.agent.id == agent.id  
    assert db_task.task_number is not None  # Ensure task_number is assigned

    # Test the get_task_by_project_and_number CRUD function
    # Retrieve using the composite primary key
    retrieved_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=project.id, task_number=db_task.task_number)
    assert retrieved_task is not None
    assert retrieved_task.task_number == db_task.task_number
    assert str(retrieved_task.project_id) == str(project.id)
    assert retrieved_task.title == task_schema.title


def test_get_task_not_found(db_session: Session):
    # Use a non-existent project_id and task_number
    assert crud_tasks.get_task_by_project_and_number(
        db_session, project_id=str(uuid.uuid4()), task_number=9999) is None


def test_get_tasks_with_filtering(db_session: Session):
    # Setup: Directly create related models and tasks for this test
    project1 = models.Project(id=str(uuid.uuid4()), name="Filter Project 1")
    project2 = models.Project(id=str(uuid.uuid4()), name="Filter Project 2")
    db_session.add(project1)
    db_session.add(project2)
    db_session.commit()
    db_session.refresh(project1)
    db_session.refresh(project2)
    project1_id = project1.id
    project2_id = project2.id

    # Ensure project_id is passed correctly when creating tasks
    crud_tasks.create_task(db_session, project_id=project1.id, task=schemas.TaskCreate(
        title="P1 Task 1", project_id=project1_id))
    crud_tasks.create_task(db_session, project_id=project1.id, task=schemas.TaskCreate(
        title="P1 Task 2", project_id=project1_id))
    crud_tasks.create_task(db_session, project_id=project2.id, task=schemas.TaskCreate(
        title="P2 Task 1", project_id=project2_id))

    # Test the get_tasks CRUD function with project filtering
    tasks_project1 = crud_tasks.get_tasks(db_session, project_id=project1_id)
    assert len(tasks_project1) == 2
    assert all(t.project_id == project1_id for t in tasks_project1)

    tasks_project2 = crud_tasks.get_tasks(db_session, project_id=project2_id)
    assert len(tasks_project2) == 1
    assert all(t.project_id == project2_id for t in tasks_project2)

    # If get_tasks is intended to retrieve all tasks without a project_id filter,
    # this test would need to be expanded or a new test added.
    # Based on the signature `get_tasks(db: Session, project_id: str, ...)` it seems to require project_id.
    pass  # Test focuses on per-project retrieval


def test_update_task(db_session: Session):
    # Setup: Directly create related models and a task for this test
    project = models.Project(id=str(uuid.uuid4()), name="Test Project", description="...")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    project_id = project.id

    task = crud_tasks.create_task(db_session, project_id=project.id, task=schemas.TaskCreate(
        title="Task to Update", project_id=project_id))
    task_project_id = task.project_id
    task_number = task.task_number

    update_data = crud_tasks.schemas.TaskUpdate(
        title="Updated Task Title", status=schemas.TaskStatusEnum.DONE, is_archived=True) # Use enum for status

    # Test the update_task_by_project_and_number CRUD function
    updated_task = crud_tasks.update_task_by_project_and_number(
        db=db_session, project_id=task_project_id, task_number=task_number, task=update_data)

    assert updated_task is not None
    assert updated_task.project_id == task_project_id
    assert updated_task.task_number == task_number
    assert updated_task.title == update_data.title
    assert updated_task.status == update_data.status
    assert updated_task.is_archived is update_data.is_archived

    # Verify persistence by retrieving again
    retrieved_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=task_project_id, task_number=task_number)
    assert retrieved_task.title == update_data.title
    assert retrieved_task.status == update_data.status
    assert retrieved_task.is_archived is update_data.is_archived

    # Test updating non-existent task using composite key
    update_non_existent_data = crud_tasks.schemas.TaskUpdate(
        title="Should Not Update")
    non_existent_update = crud_tasks.update_task_by_project_and_number(
        db=db_session, project_id=task_project_id, task_number=task_number + 999, task=update_non_existent_data)
    assert non_existent_update is None


def test_delete_task(db_session: Session):
    # Setup: Directly create related models and a task for this test
    project = models.Project(id=str(uuid.uuid4()), name="Test Project", description="...")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    task = crud_tasks.create_task(db_session, project_id=project.id, task=schemas.TaskCreate(
        title="Task To Delete", project_id=project.id))

    # Ensure task exists before deletion
    initial_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=project.id, task_number=task.task_number)
    assert initial_task is not None

    # Test the delete_task_by_project_and_number CRUD function
    success = crud_tasks.delete_task_by_project_and_number(
        db_session, project_id=project.id, task_number=task.task_number)
    assert success is True

    # Verify task is deleted using composite key
    deleted_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=project.id, task_number=task.task_number)
    assert deleted_task is None

    # Test deleting non-existent task using composite key
    success_non_existent = crud_tasks.delete_task_by_project_and_number(
        db_session, project_id=project.id, task_number=task.task_number + 999)
    assert success_non_existent is False

# --- Task CRUD Tests End --- 