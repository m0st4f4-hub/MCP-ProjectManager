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
    db_project = models.Project(
        id=str(uuid.uuid4()),
        name=project_schema.name,
        description=project_schema.description
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# --- Project CRUD Tests ---
def test_create_and_get_project(db_session: Session):
    project_schema = schemas.ProjectCreate(
        name="Test Project Alpha", description="Alpha Test Description")
    db_project = crud_projects.create_project(db=db_session, project=project_schema)
    assert db_project is not None
    assert db_project.name == project_schema.name
    assert db_project.description == project_schema.description
    assert db_project.id is not None

    retrieved_project = crud_projects.get_project(
        db=db_session, project_id=db_project.id)
    assert retrieved_project is not None
    assert retrieved_project.id == db_project.id
    assert retrieved_project.name == project_schema.name

    retrieved_by_name = crud_projects.get_project_by_name(
        db=db_session, name=project_schema.name)
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_project.id


def test_get_project_not_found(db_session: Session):
    retrieved_project = crud_projects.get_project(db=db_session, project_id=str(uuid.uuid4()))
    assert retrieved_project is None
    retrieved_by_name = crud_projects.get_project_by_name(
        db=db_session, name="NonExistentProject")
    assert retrieved_by_name is None


def test_get_projects(db_session: Session):
    project1 = models.Project(id=str(uuid.uuid4()), name="Project List Test 1", description="Desc 1")
    project2 = models.Project(id=str(uuid.uuid4()), name="Project List Test 2", description="Desc 2")
    
    db_session.add(project1)
    db_session.add(project2)
    db_session.commit()

    projects_after = crud_projects.get_projects(db=db_session)
    
    db_session.query(models.Project).delete()
    db_session.commit()

    project1_clean = models.Project(id=str(uuid.uuid4()), name="Project List Test Clean 1", description="Desc C1")
    project2_clean = models.Project(id=str(uuid.uuid4()), name="Project List Test Clean 2", description="Desc C2")
    db_session.add(project1_clean)
    db_session.add(project2_clean)
    db_session.commit()

    projects_after_clean = crud_projects.get_projects(db=db_session)
    assert len(projects_after_clean) == 2


def test_update_project(db_session: Session):
    project = models.Project(id=str(uuid.uuid4()), name="Original Project Name", description="Original Desc")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    update_data = schemas.ProjectUpdate(
        name="Updated Project Name", description="Updated Desc")
    updated_project = crud_projects.update_project(
        db=db_session, project_id=project.id, project_update=update_data)
    assert updated_project is not None
    assert updated_project.name == update_data.name
    assert updated_project.description == update_data.description

    retrieved_project = crud_projects.get_project(db=db_session, project_id=project.id)
    assert retrieved_project.name == update_data.name
    assert retrieved_project.description == update_data.description

    non_existent_update = crud_projects.update_project(
        db=db_session, project_id=str(uuid.uuid4()), project_update=update_data)
    assert non_existent_update is None


def test_delete_project(db_session: Session):
    project = models.Project(id=str(uuid.uuid4()), name="To Be Deleted", description="Delete me")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    project_id = project.id

    deleted_project = crud_projects.delete_project(db=db_session, project_id=project_id)
    assert deleted_project is not None
    assert deleted_project.id == project_id
    assert crud_projects.get_project(db=db_session, project_id=project_id) is None

    non_existent_delete = crud_projects.delete_project(db=db_session, project_id=str(uuid.uuid4()))
    assert non_existent_delete is None


def test_delete_project_with_tasks_and_mock_print(db_session: Session):
    project = models.Project(id=str(uuid.uuid4()), name="Project With Tasks For Print Mock Test", description="...")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    project_id = project.id

    task1_schema = schemas.TaskCreate(title="Task 1 for Print Mock Test", project_id=project_id)
    task2_schema = schemas.TaskCreate(title="Task 2 for Print Mock Test", project_id=project_id)
    crud_tasks.create_task(db_session, project_id=project_id, task=task1_schema, agent_id=None)
    crud_tasks.create_task(db_session, project_id=project_id, task=task2_schema, agent_id=None)

    expected_print_arg = f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project_id}"

    with mock.patch('builtins.print') as mock_print:
        deleted_project = crud_projects.delete_project(
            db=db_session, project_id=project_id)

    assert deleted_project is not None
    assert crud_projects.get_project(db=db_session, project_id=project_id) is None

    tasks_after_delete = crud_tasks.get_tasks(db_session, project_id=project_id)
    assert len(tasks_after_delete) == 0

    mock_print.assert_called_once_with(expected_print_arg)


def test_delete_project_prints_task_count(db_session):
    project = models.Project(id=str(uuid.uuid4()), name="Project with Tasks", description="...")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    task1 = crud_tasks.create_task(db_session, project.id, task=schemas.TaskCreate(title="Task 1", project_id=project.id), agent_id=None)
    task2 = crud_tasks.create_task(db_session, project.id, task=schemas.TaskCreate(title="Task 2", project_id=project.id), agent_id=None)

    import sys
    from io import StringIO
    stdout = StringIO()
    sys.stdout = stdout

    try:
        deleted_project = crud_projects.delete_project(db_session, project_id=project.id)
        output = stdout.getvalue()
        assert f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project.id}" in output
        assert deleted_project is not None
        assert deleted_project.id == project.id
        assert crud_projects.get_project(db_session, project_id=project.id) is None

    finally:
        sys.stdout = sys.__stdout__

# --- Project CRUD Tests End --- 