# Project: project-manager

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodule with alias
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks

# Helper function to create a project for testing other entities
def create_test_project(db: Session, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    return crud_projects.create_project(db=db, project=project_schema)

# --- Project CRUD Tests ---
def test_create_and_get_project(db_session: Session):
    project_schema = schemas.ProjectCreate(
        name="Test Project Alpha", description="Alpha Test Description")
    db_project = crud_projects.create_project(db=db_session, project=project_schema)
    assert db_project is not None
    assert db_project.name == "Test Project Alpha"
    assert db_project.description == "Alpha Test Description"
    assert db_project.id is not None

    retrieved_project = crud_projects.get_project(
        db=db_session, project_id=db_project.id)
    assert retrieved_project is not None
    assert retrieved_project.id == db_project.id
    assert retrieved_project.name == "Test Project Alpha"

    retrieved_by_name = crud_projects.get_project_by_name(
        db=db_session, name="Test Project Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_project.id


def test_get_project_not_found(db_session: Session):
    retrieved_project = crud_projects.get_project(db=db_session, project_id=9999)
    assert retrieved_project is None
    retrieved_by_name = crud_projects.get_project_by_name(
        db=db_session, name="NonExistentProject")
    assert retrieved_by_name is None


def test_get_projects(db_session: Session):
    projects_before = crud_projects.get_projects(db=db_session)
    create_test_project(db_session, name="Project List Test 1")
    create_test_project(db_session, name="Project List Test 2")
    projects_after = crud_projects.get_projects(db=db_session)
    assert len(projects_after) == len(projects_before) + 2


def test_update_project(db_session: Session):
    project = create_test_project(db_session, name="Original Project Name")
    update_data = schemas.ProjectUpdate(
        name="Updated Project Name", description="Updated Desc")
    updated_project = crud_projects.update_project(
        db=db_session, project_id=project.id, project_update=update_data)
    assert updated_project is not None
    assert updated_project.name == "Updated Project Name"
    assert updated_project.description == "Updated Desc"

    # Test updating non-existent project
    non_existent_update = crud_projects.update_project(
        db=db_session, project_id=999, project_update=update_data)
    assert non_existent_update is None


def test_delete_project(db_session: Session):
    project = create_test_project(db_session, name="To Be Deleted")
    project_id = project.id
    deleted_project = crud_projects.delete_project(db=db_session, project_id=project_id)
    assert deleted_project is not None
    assert deleted_project.id == project_id
    assert crud_projects.get_project(db=db_session, project_id=project_id) is None

    # Test deleting non-existent project
    non_existent_delete = crud_projects.delete_project(db=db_session, project_id=999)
    assert non_existent_delete is None


# Renamed and removed capsys
def test_delete_project_with_tasks_and_mock_print(db_session: Session):
    # Create a project
    project = create_test_project(
        db_session, name="Project With Tasks For Print Mock Test")
    project_id = project.id

    # Create tasks associated with this project
    crud_tasks.create_task(db_session, project_id, task=schemas.TaskCreate(
        title="Task 1 for Print Mock Test", project_id=project_id), agent_id=None)
    crud_tasks.create_task(db_session, project_id, task=schemas.TaskCreate(
        title="Task 2 for Print Mock Test", project_id=project_id), agent_id=None)

    expected_print_arg = f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project_id}"

    with mock.patch('builtins.print') as mock_print:
        deleted_project = crud_projects.delete_project(
            db=db_session, project_id=project_id)

    assert deleted_project is not None
    assert crud_projects.get_project(db=db_session, project_id=project_id) is None

    # Check that tasks are deleted (cascade)
    tasks_after_delete = crud_tasks.get_tasks(db_session, project_id=project_id)
    assert len(tasks_after_delete) == 0

    mock_print.assert_called_once_with(expected_print_arg)


def test_delete_project_prints_task_count(db_session):
    # Create a project with some tasks
    project = crud_projects.create_project(
        db_session, schemas.ProjectCreate(name="Project with Tasks"))
    task1 = crud_tasks.create_task(db_session, project.id, task=schemas.TaskCreate(
        title="Task 1", project_id=project.id), agent_id=None)
    task2 = crud_tasks.create_task(db_session, project.id, task=schemas.TaskCreate(
        title="Task 2", project_id=project.id), agent_id=None)

    import sys
    from io import StringIO
    stdout = StringIO()
    sys.stdout = stdout

    try:
        crud_projects.delete_project(db_session, project_id=project.id)
        output = stdout.getvalue()
        assert f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project.id}" in output
    finally:
        sys.stdout = sys.__stdout__

# --- Project CRUD Tests End --- 