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
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    return crud_projects.create_project(db=db, project=project_schema)

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud_agents.create_agent(db=db, agent=agent_schema)

# --- Task CRUD Tests ---
def test_create_and_get_task(db_session: Session):
    project = create_test_project(db_session)
    agent = create_test_agent(db_session)

    task_schema = schemas.TaskCreate(
        title="Test Task Alpha",
        description="Task Alpha Description",
        # Ensure project.id is a string if the schema expects string
        project_id=str(project.id),
        agent_name=agent.name
    )
    # The create_task function in crud.py should handle assigning the task_number
    db_task = crud_tasks.create_task(
        db_session, project.id, task=task_schema, agent_id=None)
    assert db_task is not None
    assert db_task.title == "Test Task Alpha"
    assert str(db_task.project_id) == str(
        project.id)  # Ensure comparison is type-safe
    assert db_task.agent is not None  # Check agent relationship is loaded
    assert db_task.agent.id == agent.id  # Check correct agent is linked
    assert db_task.task_number is not None  # Ensure task_number is assigned

    # Retrieve using the composite primary key
    retrieved_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=project.id, task_number=db_task.task_number)
    assert retrieved_task is not None
    assert retrieved_task.task_number == db_task.task_number
    assert str(retrieved_task.project_id) == str(project.id)
    assert retrieved_task.title == "Test Task Alpha"  # Add assertion for title


def test_get_task_not_found(db_session: Session):
    # Use a non-existent project_id and task_number
    assert crud_tasks.get_task_by_project_and_number(
        db_session, project_id="nonexistent_project", task_number=9999) is None


def test_get_tasks_with_filtering(db_session: Session):
    project1 = create_test_project(db_session, name="Filter Project 1")
    project1_id = project1.id
    project2 = create_test_project(db_session, name="Filter Project 2")
    project2_id = project2.id

    crud_tasks.create_task(db_session, project1.id, task=schemas.TaskCreate(
        title="P1 Task 1", project_id=project1_id))
    crud_tasks.create_task(db_session, project1.id, task=schemas.TaskCreate(
        title="P1 Task 2", project_id=project1_id))
    crud_tasks.create_task(db_session, project2.id, task=schemas.TaskCreate(
        title="P2 Task 1", project_id=project2_id))

    tasks_project1 = crud_tasks.get_tasks(db_session, project_id=project1_id)
    assert len(tasks_project1) == 2
    assert all(t.project_id == project1_id for t in tasks_project1)

    tasks_project2 = crud_tasks.get_tasks(db_session, project_id=project2_id)
    assert len(tasks_project2) == 1
    assert all(t.project_id == project2_id for t in tasks_project2)

    # Test getting all tasks (assuming get_tasks without project_id gets all, or update test)
    # Based on the signature in tasks.py, it requires project_id. So this test needs refinement
    # to check tasks across projects if that functionality is desired.
    # For now, assume get_tasks is per project.
    pass  # Skipping global get_tasks check for now


def test_update_task(db_session: Session):
    project = create_test_project(db_session)
    project_id = project.id
    task = crud_tasks.create_task(db_session, project.id, task=crud_tasks.schemas.TaskCreate(
        title="Task to Update", project_id=project_id))
    task_project_id = task.project_id
    task_number = task.task_number

    update_data = crud_tasks.schemas.TaskUpdate(
        title="Updated Task Title", status="Done", is_archived=True)

    # Update task using project_id and task_number
    updated_task = crud_tasks.update_task_by_project_and_number(
        db=db_session, project_id=task_project_id, task_number=task_number, task=update_data)

    assert updated_task is not None
    assert updated_task.project_id == task_project_id
    assert updated_task.task_number == task_number
    assert updated_task.title == "Updated Task Title"
    assert updated_task.status == "Done"
    assert updated_task.is_archived is True

    # Verify persistence
    retrieved_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=task_project_id, task_number=task_number)
    assert retrieved_task.title == "Updated Task Title"
    assert retrieved_task.status == "Done"
    assert retrieved_task.is_archived is True


def test_delete_task(db_session: Session):
    project = create_test_project(db_session)
    task = crud_tasks.create_task(db_session, project.id, task=schemas.TaskCreate(
        title="Task To Delete", project_id=str(project.id)))

    # Ensure task exists before deletion
    initial_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=project.id, task_number=task.task_number)
    assert initial_task is not None

    # Delete the task using composite key
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