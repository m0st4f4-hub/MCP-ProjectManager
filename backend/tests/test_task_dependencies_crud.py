# Project: project-manager

import pytest
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from fastapi import HTTPException

# Import models and schemas directly
# Import models
from backend import models

# Import specific schemas as needed
from backend.schemas.task import TaskCreate, TaskUpdate
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.schemas.task_dependency import TaskDependencyCreate

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks
from backend.crud import task_dependencies as crud_task_dependencies

# Import the service layer
from backend.services.task_dependency_service import TaskDependencyService

# Helper function to create a project for testing other entities
async def create_test_project(db: AsyncSession, name="Test Project") -> models.Project:
    project_schema = ProjectCreate(
        name=name, description="A test project")
    return await crud_projects.create_project(db=db, project=project_schema)

# Helper function to create a task for testing dependencies
async def create_test_task(db: AsyncSession, project_id: uuid.UUID, title="Test Task") -> models.Task:
    task_create_schema = TaskCreate(title=title, project_id=str(project_id))
    return await crud_tasks.create_task(db, project_id, task=task_create_schema)

# --- Task Dependency CRUD Tests ---

async def test_create_and_get_task_dependency(async_db_session: AsyncSession):
    project = await create_test_project(async_db_session, name="Dependency Project")
    # Using crud directly for task creation.
    task1 = await create_test_task(async_db_session, project.id, title="Task 1 for Dep")
    task2 = await create_test_task(async_db_session, project.id, title="Task 2 for Dep")

    # Add dependency: Task 1 -> Task 2
    dependency_data = TaskDependencyCreate(
        predecessor_task_project_id=str(project.id),
        predecessor_task_number=task1.task_number,
        successor_task_project_id=str(project.id),
        successor_task_number=task2.task_number,
        predecessor_project_id=str(project.id),
        successor_project_id=str(project.id),
        dependency_type="blocks"
    )
    # Test CRUD function directly
    db_dependency = await crud_task_dependencies.create_task_dependency(
        async_db_session,
        task_dependency=dependency_data
    )
    assert db_dependency is not None
    assert str(db_dependency.predecessor_project_id) == str(project.id)
    assert db_dependency.predecessor_task_number == task1.task_number
    assert str(db_dependency.successor_project_id) == str(project.id)
    assert db_dependency.successor_task_number == task2.task_number

    # Get the dependency using CRUD
    retrieved_dependency = await crud_task_dependencies.get_task_dependency(
        async_db_session,
        predecessor_project_id=project.id,
        predecessor_task_number=task1.task_number,
        successor_project_id=project.id,
        successor_task_number=task2.task_number
    )
    assert retrieved_dependency is not None
    assert str(retrieved_dependency.predecessor_project_id) == str(project.id)
    assert retrieved_dependency.predecessor_task_number == task1.task_number
    assert str(retrieved_dependency.successor_project_id) == str(project.id)
    assert retrieved_dependency.successor_task_number == task2.task_number


async def test_get_task_dependency_not_found(async_db_session: AsyncSession):
    # Test CRUD function directly
    assert await crud_task_dependencies.get_task_dependency(
        async_db_session,
        predecessor_project_id=str(uuid.uuid4()),
        predecessor_task_number=999,
        successor_project_id=str(uuid.uuid4()),
        successor_task_number=888
    ) is None


async def test_remove_task_dependency(async_db_session: AsyncSession):
    project = await create_test_project(async_db_session, name="Remove Dependency Project")
    task1 = await create_test_task(async_db_session, project.id, title="Task 1 for Remove Dep")
    task2 = await create_test_task(async_db_session, project.id, title="Task 2 for Remove Dep")

    # Add dependency using CRUD
    dependency_data = TaskDependencyCreate(
        predecessor_task_project_id=str(project.id),
        predecessor_task_number=task1.task_number,
        successor_task_project_id=str(project.id),
        successor_task_number=task2.task_number,
        predecessor_project_id=str(project.id),
        successor_project_id=str(project.id),
        dependency_type="blocks"
    )
    await crud_task_dependencies.create_task_dependency(async_db_session,
        task_dependency=dependency_data
    )
    assert await crud_task_dependencies.get_task_dependency(async_db_session,
        predecessor_project_id=project.id,
        predecessor_task_number=task1.task_number,
        successor_project_id=project.id,
        successor_task_number=task2.task_number) is not None

    # Remove the dependency using CRUD
    success = await crud_task_dependencies.delete_task_dependency(async_db_session,
        predecessor_project_id=project.id,
        predecessor_task_number=task1.task_number,
        successor_project_id=project.id,
        successor_task_number=task2.task_number)
    assert success is True
    assert await crud_task_dependencies.get_task_dependency(async_db_session,
        predecessor_project_id=project.id,
        predecessor_task_number=task1.task_number,
        successor_project_id=project.id,
        successor_task_number=task2.task_number) is None

    # Try removing a non-existent dependency using CRUD
    success_not_found = await crud_task_dependencies.delete_task_dependency(async_db_session,
        predecessor_project_id=project.id,
        predecessor_task_number=task1.task_number, # Use same IDs as removed
        successor_project_id=project.id,
        successor_task_number=task2.task_number)
    assert success_not_found is False


async def test_add_task_dependency_circular(async_db_session: AsyncSession):
    project = await create_test_project(
        async_db_session, name="Circular Dependency Project")
    task1 = await create_test_task(async_db_session, project.id, title="Task 1 for Circular")
    task2 = await create_test_task(async_db_session, project.id, title="Task 2 for Circular")
    task3 = await create_test_task(async_db_session, project.id, title="Task 3 for Circular")

    # Add dependency Task 1 -> Task 2 using the service (this passes validation)
    dependency_data_1_2 = TaskDependencyCreate(
        predecessor_task_project_id=str(project.id),
        predecessor_task_number=task1.task_number,
        successor_task_project_id=str(project.id),
        successor_task_number=task2.task_number,
        predecessor_project_id=str(project.id),
        successor_project_id=str(project.id),
        dependency_type="blocks"
    )
    service = TaskDependencyService(async_db_session)
    await service.add_dependency(
        predecessor_task_project_id=dependency_data_1_2.predecessor_project_id,
        predecessor_task_number=dependency_data_1_2.predecessor_task_number,
        successor_task_project_id=dependency_data_1_2.successor_project_id,
        successor_task_number=dependency_data_1_2.successor_task_number,
        dependency_type="blocks"
    )

    # Now try adding dependency Task 2 -> Task 1 using the service (this should create a circular dependency and raise HTTPException)
    dependency_data_2_1 = TaskDependencyCreate(
        predecessor_task_project_id=str(project.id),
        predecessor_task_number=task2.task_number,
        successor_task_project_id=str(project.id),
        successor_task_number=task1.task_number,
        predecessor_project_id=str(project.id),
        successor_project_id=str(project.id),
        dependency_type="blocks"
    )
    with pytest.raises(HTTPException) as excinfo:
        await service.add_dependency(
            predecessor_task_project_id=dependency_data_2_1.predecessor_project_id,
            predecessor_task_number=dependency_data_2_1.predecessor_task_number,
            successor_task_project_id=dependency_data_2_1.successor_project_id,
            successor_task_number=dependency_data_2_1.successor_task_number,
            dependency_type="blocks"
        )
    assert excinfo.value.status_code == 400
    assert "Circular dependency detected" in str(excinfo.value.detail)

    # Add more complex circular dependency tests if needed (e.g., A -> B -> C -> A)
    # # Add dependency Task 2 -> Task 3 using the service
    # dependency_data_2_3 = TaskDependencyCreate(
    #     predecessor_task_project_id=str(project.id),
    #     predecessor_task_number=task2.task_number,
    #     successor_task_project_id=str(project.id),
    #     successor_task_number=task3.task_number,
    #     predecessor_project_id=str(project.id),
    #     successor_project_id=str(project.id),
    #     dependency_type="blocks"
    # )
    # await service.add_dependency(
    #     predecessor_task_project_id=dependency_data_2_3.predecessor_project_id,
    #     predecessor_task_number=dependency_data_2_3.predecessor_task_number,
    #     successor_task_project_id=dependency_data_2_3.successor_project_id,
    #     successor_task_number=dependency_data_2_3.successor_task_number,
    #     dependency_type="blocks"
    # )
    # # Try adding dependency Task 3 -> Task 1 using the service (should create A->B->C->A circularity)
    # dependency_data_3_1 = TaskDependencyCreate(
    #     predecessor_task_project_id=str(project.id),
    #     predecessor_task_number=task3.task_number,
    #     successor_task_project_id=str(project.id),
    #     successor_task_number=task1.task_number,
    #     predecessor_project_id=str(project.id),
    #     successor_project_id=str(project.id),
    #     dependency_type="blocks"
    # )
    # with pytest.raises(HTTPException) as excinfo:
    #     await service.add_dependency(
    #         predecessor_task_project_id=dependency_data_3_1.predecessor_project_id,
    #         predecessor_task_number=dependency_data_3_1.predecessor_task_number,
    #         successor_task_project_id=dependency_data_3_1.successor_project_id,
    #         successor_task_number=dependency_data_3_1.successor_task_number,
    #         dependency_type="blocks"
    #     )
    # assert excinfo.value.status_code == 400
    # assert "Circular dependency detected" in str(excinfo.value.detail)


async def test_add_task_dependency_self(async_db_session: AsyncSession):
    project = await create_test_project(async_db_session, name="Self Dependency Project")
    task = await create_test_task(async_db_session, project.id, title="Task for Self Dep")

    # Try adding dependency: Task -> Task using the service (should raise HTTPException)
    dependency_data = TaskDependencyCreate(
        predecessor_task_project_id=str(project.id),
        predecessor_task_number=task.task_number,
        successor_task_project_id=str(task.project_id),
        successor_task_number=task.task_number,
        predecessor_project_id=str(project.id),
        successor_project_id=str(project.id),
        dependency_type="blocks"
    )
    service = TaskDependencyService(async_db_session)
    with pytest.raises(HTTPException) as excinfo:
        await service.add_dependency(
            predecessor_task_project_id=dependency_data.predecessor_project_id,
            predecessor_task_number=dependency_data.predecessor_task_number,
            successor_task_project_id=dependency_data.successor_project_id,
            successor_task_number=dependency_data.successor_task_number,
            dependency_type="blocks"
        )
    assert excinfo.value.status_code == 400
    assert "A task cannot be dependent on itself" in str(excinfo.value.detail)


# --- Task Dependency CRUD Tests End --- 