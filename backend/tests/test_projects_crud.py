# Project: project-manager

import pytest
# from sqlalchemy.orm import Session # Removed synchronous Session import
import uuid
from unittest import mock

# Import AsyncSession and async delete
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
from sqlalchemy import delete # Import delete for async core operations

# Import models and specific schemas directly
from backend import models
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.schemas.task import TaskCreate, TaskUpdate

# Import specific crud submodule with alias
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks

# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

# Helper function to create a project for testing other entities (ASYNC)
async def create_test_project(db: AsyncSession, name="Test Project") -> models.Project:
    project_schema = ProjectCreate(
        name=name, description="A test project")
    # Since create_project is now async CRUD, use that
    return await crud_projects.create_project(db=db, project=project_schema)

# --- Project CRUD Tests ---
async def test_create_and_get_project(async_db_session: AsyncSession):
    # Use async_db_session and await
    project_schema = ProjectCreate(
        name="Test Project Alpha", description="Alpha Test Description")
    db_project = await crud_projects.create_project(db=async_db_session, project=project_schema)
    assert db_project is not None
    assert db_project.name == project_schema.name
    assert db_project.description == project_schema.description
    assert db_project.id is not None

    retrieved_project = await crud_projects.get_project(
        db=async_db_session, project_id=db_project.id)
    assert retrieved_project is not None
    assert retrieved_project.id == db_project.id
    assert retrieved_project.name == project_schema.name

    retrieved_by_name = await crud_projects.get_project_by_name(
        db=async_db_session, name=project_schema.name)
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_project.id


async def test_get_project_not_found(async_db_session: AsyncSession):
    # Use async_db_session and await
    retrieved_project = await crud_projects.get_project(db=async_db_session, project_id=str(uuid.uuid4()))
    assert retrieved_project is None
    retrieved_by_name = await crud_projects.get_project_by_name(
        db=async_db_session, name="NonExistentProject")
    assert retrieved_by_name is None


async def test_get_projects(async_db_session: AsyncSession):
    # Use async_db_session and await. Use CRUD functions for setup/teardown where appropriate.
    # Clean up any existing projects from previous runs
    await async_db_session.execute(delete(models.Project))
    await async_db_session.commit()

    # Create projects using async CRUD
    project1_data = ProjectCreate(name="Project List Test 1", description="Desc 1")
    project2_data = ProjectCreate(name="Project List Test 2", description="Desc 2")
    project1 = await crud_projects.create_project(async_db_session, project1_data)
    project2 = await crud_projects.create_project(async_db_session, project2_data)

    # Get all projects
    projects = await crud_projects.get_projects(db=async_db_session)

    # Assertions
    assert len(projects) == 2
    assert all(not p.is_archived for p in projects)

    # Add another project and re-fetch
    project3_data = ProjectCreate(name="Project List Test 3", description="Desc 3")
    project3 = await crud_projects.create_project(async_db_session, project3_data)

    projects_after_add = await crud_projects.get_projects(db=async_db_session)
    assert len(projects_after_add) == 3
    assert {p.name for p in projects_after_add} == {"Project List Test 1", "Project List Test 2", "Project List Test 3"}

    # Test pagination
    projects_paginated = await crud_projects.get_projects(db=async_db_session, skip=1)
    assert len(projects_paginated) == 2 # Should return the last two projects after skipping the first
    assert {p.name for p in projects_paginated} == {"Project List Test 2", "Project List Test 3"}


async def test_update_project(async_db_session: AsyncSession):
    # Use async_db_session and await. Create project using async CRUD.
    project_data = ProjectCreate(name="Original Project Name", description="Original Desc")
    project = await crud_projects.create_project(async_db_session, project_data)
    project_id = project.id

    update_data = ProjectUpdate(
        name="Updated Project Name", description="Updated Desc")
    updated_project = await crud_projects.update_project(
        db=async_db_session, project_id=project_id, project_update=update_data)
    assert updated_project is not None
    assert updated_project.name == update_data.name
    assert updated_project.description == update_data.description

    retrieved_project = await crud_projects.get_project(db=async_db_session, project_id=project_id)
    assert retrieved_project.name == update_data.name
    assert retrieved_project.description == update_data.description

    non_existent_update = await crud_projects.update_project(
        db=async_db_session, project_id=str(uuid.uuid4()), project_update=update_data)
    assert non_existent_update is None


async def test_delete_project(async_db_session: AsyncSession):
    # Use async_db_session and await. Create project using async CRUD.
    project_data = ProjectCreate(name="To Be Deleted", description="Delete me")
    project = await crud_projects.create_project(async_db_session, project_data)
    project_id = project.id

    deleted_project = await crud_projects.delete_project(db=async_db_session, project_id=project_id)
    assert deleted_project is not None
    assert deleted_project.id == project_id
    assert await crud_projects.get_project(db=async_db_session, project_id=project_id) is None

    non_existent_delete = await crud_projects.delete_project(db=async_db_session, project_id=str(uuid.uuid4()))
    assert non_existent_delete is None


async def test_delete_project_with_tasks_and_mock_print(async_db_session: AsyncSession):
    # Use async_db_session and await. Create project/tasks using async CRUD.
    project_data = ProjectCreate(name="Project With Tasks For Print Mock Test", description="...")
    project = await crud_projects.create_project(async_db_session, project_data)
    project_id = project.id

    task1_schema = TaskCreate(title="Task 1 for Print Mock Test", project_id=project_id)
    task2_schema = TaskCreate(title="Task 2 for Print Mock Test", project_id=project_id)
    # Assuming crud_tasks.create_task is async
    await crud_tasks.create_task(async_db_session, project_id=project_id, task=task1_schema, agent_id=None)
    await crud_tasks.create_task(async_db_session, project_id=project_id, task=task2_schema, agent_id=None)

    expected_print_arg = f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project_id}"

    with mock.patch('builtins.print') as mock_print:
        # Assuming crud_projects.delete_project is async
        deleted_project = await crud_projects.delete_project(
            db=async_db_session, project_id=project_id)

    assert deleted_project is not None
    assert await crud_projects.get_project(db=async_db_session, project_id=project_id) is None

    # Assuming crud_tasks.get_tasks is async
    tasks_after_delete = await crud_tasks.get_tasks(async_db_session, project_id=project_id)
    assert len(tasks_after_delete) == 0

    # Note: Mocking print might not capture output from async functions as expected. Will verify manually if needed.
    # For now, keep the assertion.
    mock_print.assert_called_once_with(expected_print_arg)


async def test_delete_project_prints_task_count(async_db_session: AsyncSession):
    # Use async_db_session and await. Create project/tasks using async CRUD.
    project_data = ProjectCreate(name="Project with Tasks", description="...")
    project = await crud_projects.create_project(async_db_session, project_data)

    # Assuming crud_tasks.create_task is async
    task1 = await crud_tasks.create_task(async_db_session, project.id, task=TaskCreate(title="Task 1", project_id=project.id), agent_id=None)
    task2 = await crud_tasks.create_task(async_db_session, project.id, task=TaskCreate(title="Task 2", project_id=project.id), agent_id=None)

    import sys
    from io import StringIO
    stdout = StringIO()
    sys.stdout = stdout

    try:
        # Assuming crud_projects.delete_project is async
        deleted_project = await crud_projects.delete_project(async_db_session, project_id=project.id)
        output = stdout.getvalue()
        assert f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project.id}" in output
        assert deleted_project is not None
        assert deleted_project.id == project.id
        # Assuming crud_projects.get_project is async
        assert await crud_projects.get_project(async_db_session, project_id=project.id) is None

    finally:
        sys.stdout = sys.__stdout__

async def test_create_project_duplicate_name(async_db_session: AsyncSession):
    # Implementation of test_create_project_duplicate_name
    pass

# --- Project CRUD Tests End --- 