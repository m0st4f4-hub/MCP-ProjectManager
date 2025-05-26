"""
Test suite for task CRUD operations.

Testing the backend.crud.tasks module functions for:
- Creating, reading, updating, and deleting tasks
- Filtering tasks by various criteria

Uses pytest, async fixtures and models directly without schemas to test
CRUD layer functions independently from API routes or services.
"""

# pylint: disable=redefined-outer-name
# pylint: disable=unused-argument
# pylint: disable=line-too-long
# pylint: disable=missing-function-docstring

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import uuid

# Import the CRUD functions to test
from backend.crud import tasks as crud_tasks

# Import related models
from backend.models import Task, Project, Agent, TaskStatus

# Import schemas
from backend.schemas.task import TaskCreate, TaskUpdate

# Import enums
from backend.enums import TaskStatusEnum


@pytest.mark.asyncio
async def test_create_and_get_task(async_db_session: AsyncSession):
    # Setup: Directly create related models for this test
    project = Project(id=str(uuid.uuid4()), name="Test Project", description="...")
    agent = Agent(id=str(uuid.uuid4()), name="Test Agent")
    async_db_session.add(project)
    async_db_session.add(agent)
    await async_db_session.commit()
    await async_db_session.refresh(project)
    await async_db_session.refresh(agent)

    task_schema = TaskCreate(
        title="Test Task Alpha",
        description="Task Alpha Description",
        agent_name="Test Agent"
    )

    # Test CREATE
    created_task = await crud_tasks.create_task(
        db=async_db_session,
        project_id=str(project.id),
        task=task_schema
    )
    assert created_task is not None
    assert created_task.title == task_schema.title
    assert created_task.description == task_schema.description
    assert created_task.project_id == project.id
    assert created_task.agent_id is not None
    assert created_task.status == TaskStatusEnum.TO_DO  # Default status
    assert created_task.task_number == 1  # First task in project

    # Test GET by ID
    retrieved_task = await crud_tasks.get_task_by_project_and_number(
        db=async_db_session,
        project_id=str(project.id),
        task_number=created_task.task_number
    )
    assert retrieved_task is not None
    assert retrieved_task.project_id == created_task.project_id
    assert retrieved_task.task_number == created_task.task_number
    assert retrieved_task.title == created_task.title


@pytest.mark.asyncio
async def test_get_task_not_found(async_db_session: AsyncSession):
    # Test getting a non-existent task
    task = await crud_tasks.get_task_by_project_and_number(
        db=async_db_session,
        project_id="non-existent-project",
        task_number=999
    )
    assert task is None


@pytest.mark.asyncio
async def test_get_tasks_with_filtering(async_db_session: AsyncSession):
    # Setup: Create project and multiple tasks
    project = Project(id=str(uuid.uuid4()), name="Filter Test Project", description="...")
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)

    # Create multiple tasks with different statuses
    task1 = await crud_tasks.create_task(
        db=async_db_session,
        project_id=str(project.id),
        task=TaskCreate(
            title="Task 1",
            description="First task",
            status=TaskStatusEnum.TO_DO
        )
    )

    task2 = await crud_tasks.create_task(
        db=async_db_session,
        project_id=str(project.id),
        task=TaskCreate(
            title="Task 2",
            description="Second task",
            status=TaskStatusEnum.IN_PROGRESS
        )
    )

    # Create an archived task
    archived_task = await crud_tasks.create_task(
        db=async_db_session,
        project_id=str(project.id),
        task=TaskCreate(
            title="Archived Task",
            description="This is archived",
            status=TaskStatusEnum.TO_DO
        )
    )
    # Manually archive it
    archived_task.is_archived = True
    await async_db_session.commit()

    # Test: Get all non-archived tasks
    all_tasks = await crud_tasks.get_all_tasks(db=async_db_session, project_id=str(project.id), is_archived=False)
    assert len(all_tasks) >= 2
    assert not any(task.is_archived for task in all_tasks)

    # Test: Filter by status
    todo_tasks = await crud_tasks.get_all_tasks(
        db=async_db_session,
        project_id=str(project.id),
        status=TaskStatusEnum.TO_DO,
        is_archived=False
    )
    assert all(task.status == TaskStatusEnum.TO_DO for task in todo_tasks)

    # Test: Filter by project
    # project_tasks = await crud_tasks.get_tasks(
    #     db=async_db_session,
    #     project_id=str(project.id)
    # )
    # assert all(task.project_id == project.id for task in project_tasks)


@pytest.mark.asyncio
async def test_update_task(async_db_session: AsyncSession):
    # Setup: Create a task
    project = Project(id=str(uuid.uuid4()), name="Update Test Project", description="...")
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)

    original_task = await crud_tasks.create_task(
        db=async_db_session,
        project_id=str(project.id),
        task=TaskCreate(
            title="Original Title",
            description="Original Description",
            status=TaskStatusEnum.TO_DO
        )
    )

    # Test UPDATE
    update_data = TaskUpdate(
        title="Updated Title",
        description="Updated Description",
        status=TaskStatusEnum.IN_PROGRESS
    )

    updated_task = await crud_tasks.update_task_by_project_and_number(
        db=async_db_session,
        project_id=str(project.id),
        task_number=original_task.task_number,
        task=update_data
    )

    assert updated_task is not None
    assert updated_task.project_id == original_task.project_id
    assert updated_task.task_number == original_task.task_number
    assert updated_task.title == update_data.title
    assert updated_task.description == update_data.description
    assert updated_task.status == update_data.status


@pytest.mark.asyncio
async def test_delete_task(async_db_session: AsyncSession):
    # Setup: Create a task
    project = Project(id=str(uuid.uuid4()), name="Delete Test Project", description="...")
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)

    task = await crud_tasks.create_task(
        db=async_db_session,
        project_id=str(project.id),
        task=TaskCreate(
            title="Task to Delete",
            description="This will be deleted"
        )
    )

    task_number = task.task_number

    # Test DELETE
    deleted_task = await crud_tasks.delete_task_by_project_and_number(
        db=async_db_session,
        project_id=str(project.id),
        task_number=task_number
    )

    assert deleted_task is True

    # Verify it's gone
    retrieved = await crud_tasks.get_task_by_project_and_number(
        db=async_db_session,
        project_id=str(project.id),
        task_number=task_number
    )
    assert retrieved is None
