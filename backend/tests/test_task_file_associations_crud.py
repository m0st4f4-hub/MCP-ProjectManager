# Project: project-manager

import pytest
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
import uuid

# Import models and schemas directly
from backend import models
# Import specific schemas
from backend.schemas.project import ProjectCreate
from backend.schemas.task import TaskCreate
from backend.schemas.memory import MemoryEntityCreate # Also need this for dummy entities
from backend.schemas.file_association import TaskFileAssociationCreate # Corrected import path

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks
from backend.crud import task_file_associations as crud_task_file_associations
from backend.crud import memory as memory_crud # Import memory_crud

# Helper function to create a project for testing other entities
async def create_test_project(db: AsyncSession, name="Test Project") -> models.Project:
    project_schema = ProjectCreate(
        name=name, description="A test project") # Corrected usage
    return await crud_projects.create_project(db=db, project=project_schema)

# Helper function to create a task for testing file associations
async def create_test_task(db: AsyncSession, project_id: uuid.UUID, title="Test Task") -> models.Task:
    task_create_schema = TaskCreate(title=title, project_id=str(project_id)) # Corrected usage
    return await crud_tasks.create_task(db, project_id, task=task_create_schema)

# --- Task File Association CRUD Tests ---

async def test_create_and_get_task_file_association(async_db_session: AsyncSession):
    project = await create_test_project(async_db_session, name="Task File Assoc Project")
    task = await create_test_task(async_db_session, project.id, title="Task for File Assoc")

    # Assuming MemoryEntity IDs are integers. Using dummy integer IDs for now.
    file_memory_entity_id_1 = 301 # Dummy ID
    file_memory_entity_id_2 = 302 # Dummy ID
    # Create dummy MemoryEntities for the test to simulate pre-existing entities
    dummy_entity_1 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_1, type="file", name=f"file_{file_memory_entity_id_1}", description="", metadata_={}, entity_type="file")) # Added entity_type
    dummy_entity_2 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_2, type="file", name=f"file_{file_memory_entity_id_2}", description="", metadata_={}, entity_type="file")) # Added entity_type

    # Associate file 1
    association_data_1 = TaskFileAssociationCreate(
        task_project_id=str(task.project_id),
        task_task_number=task.task_number,
        file_memory_entity_id=dummy_entity_1.id # Use the ID of the created dummy entity
    )
    db_association_1 = await crud_task_file_associations.create_task_file_association(
        async_db_session, task_file=association_data_1)
    assert db_association_1 is not None
    assert str(db_association_1.task_project_id) == str(task.project_id)
    assert db_association_1.task_task_number == task.task_number
    # Modified assertion to check file_memory_entity_id
    assert db_association_1.file_memory_entity_id == dummy_entity_1.id

    # Associate file 2
    association_data_2 = TaskFileAssociationCreate(
        task_project_id=str(task.project_id),
        task_task_number=task.task_number,
        file_memory_entity_id=dummy_entity_2.id # Use the ID of the created dummy entity
    )
    db_association_2 = await crud_task_file_associations.create_task_file_association(
        async_db_session, task_file=association_data_2)
    assert db_association_2 is not None
    assert str(db_association_2.task_project_id) == str(task.project_id)
    assert db_association_2.task_task_number == task.task_number
    # Modified assertion to check file_memory_entity_id
    assert db_association_2.file_memory_entity_id == dummy_entity_2.id

    # Get association by task and file MemoryEntity ID
    # Modified to use file_memory_entity_id
    retrieved_association = await crud_task_file_associations.get_task_file_association(
        async_db_session, task_project_id=task.project_id, task_number=task.task_number, file_memory_entity_id=dummy_entity_1.id)
    assert retrieved_association is not None
    assert str(retrieved_association.task_project_id) == str(task.project_id)
    assert retrieved_association.task_task_number == task.task_number
    # Modified assertion to check file_memory_entity_id
    assert retrieved_association.file_memory_entity_id == dummy_entity_1.id


async def test_get_task_file_association_not_found(async_db_session: AsyncSession):
    # Try getting a non-existent association
    # Modified to use file_memory_entity_id with a dummy integer ID
    assert await crud_task_file_associations.get_task_file_association(
        async_db_session, task_project_id=str(uuid.uuid4()), task_number=999, file_memory_entity_id=9999) is None


async def test_get_files_for_task(async_db_session: AsyncSession):
    project1 = await create_test_project(async_db_session, name="Task Files List 1")
    task1 = await create_test_task(async_db_session, project1.id, title="Task for file list")

    project2 = await create_test_project(async_db_session, name="Task Files List 2")
    task2 = await create_test_task(async_db_session, project2.id, title="Task for file list 2")

    # Using dummy integer MemoryEntity IDs
    file_memory_entity_id_a = 401 # Dummy ID
    file_memory_entity_id_b = 402 # Dummy ID
    file_memory_entity_id_c = 403 # Dummy ID
    # Create dummy MemoryEntities for the test
    dummy_entity_a = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_a, type="file", name=f"file_{file_memory_entity_id_a}", description="", metadata_={}, entity_type="file")) # Added entity_type
    dummy_entity_b = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_b, type="file", name=f"file_{file_memory_entity_id_b}", description="", metadata_={}, entity_type="file")) # Added entity_type
    dummy_entity_c = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_c, type="file", name=f"file_{file_memory_entity_id_c}", description="", metadata_={}, entity_type="file")) # Added entity_type

    # Associate files with task 1
    await crud_task_file_associations.associate_file_with_task(
        async_db_session, task_project_id=str(task1.project_id), task_number=task1.task_number, file_memory_entity_id=dummy_entity_a.id)
    await crud_task_file_associations.associate_file_with_task(
        async_db_session, task_project_id=str(task1.project_id), task_number=task1.task_number, file_memory_entity_id=dummy_entity_b.id)

    # Associate a file with task 2
    await crud_task_file_associations.associate_file_with_task(
        async_db_session, task_project_id=str(task2.project_id), task_number=task2.task_number, file_memory_entity_id=dummy_entity_c.id)

    # Get files for task 1
    task1_files = await crud_task_file_associations.get_files_for_task(async_db_session, task_project_id=str(task1.project_id), task_number=task1.task_number)
    assert len(task1_files) == 2
    assert any(assoc.file_memory_entity_id == dummy_entity_a.id for assoc in task1_files)
    assert any(assoc.file_memory_entity_id == dummy_entity_b.id for assoc in task1_files)

    # Get files for task 2
    task2_files = await crud_task_file_associations.get_files_for_task(async_db_session, task_project_id=str(task2.project_id), task_number=task2.task_number)
    assert len(task2_files) == 1
    assert any(assoc.file_memory_entity_id == dummy_entity_c.id for assoc in task2_files)

    # Get files for a task with no files
    project3 = await create_test_project(async_db_session, name="Project No Files")
    task3 = await create_test_task(async_db_session, project3.id, title="Task No Files")

    task3_files = await crud_task_file_associations.get_files_for_task(async_db_session, task_project_id=str(project3.id), task_number=task3.task_number)
    assert len(task3_files) == 0


async def test_disassociate_file_from_task(async_db_session: AsyncSession):
    project = await create_test_project(async_db_session, name="Task For File Disassoc")
    task = await create_test_task(async_db_session, project.id, title="Task for Disassoc")

    file_memory_entity_id_1 = 501 # Dummy ID
    file_memory_entity_id_2 = 502 # Dummy ID
    # Create dummy MemoryEntities for the test
    dummy_entity_1 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_1, type="file", name=f"file_{file_memory_entity_id_1}", description="", metadata_={}, entity_type="file")) # Added entity_type
    dummy_entity_2 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(id=file_memory_entity_id_2, type="file", name=f"file_{file_memory_entity_id_2}", description="", metadata_={}, entity_type="file")) # Added entity_type

    # Associate files
    await crud_task_file_associations.associate_file_with_task(async_db_session, task_project_id=str(task.project_id), task_number=task.task_number, file_memory_entity_id=dummy_entity_1.id)
    await crud_task_file_associations.associate_file_with_task(async_db_session, task_project_id=str(task.project_id), task_number=task.task_number, file_memory_entity_id=dummy_entity_2.id)

    # Ensure they are associated initially
    initial_files = await crud_task_file_associations.get_files_for_task(async_db_session, task_project_id=str(task.project_id), task_number=task.task_number)
    assert len(initial_files) == 2

    # Disassociate one file
    disassociated = await crud_task_file_associations.disassociate_file_from_task(
        async_db_session,
        task_project_id=str(task.project_id),
        task_number=task.task_number,
        file_memory_entity_id=dummy_entity_1.id
    )
    assert disassociated is True

    # Check that only the other file remains associated
    remaining_files = await crud_task_file_associations.get_files_for_task(async_db_session, task_project_id=str(task.project_id), task_number=task.task_number)
    assert len(remaining_files) == 1
    assert remaining_files[0].file_memory_entity_id == dummy_entity_2.id

    # Try disassociating the same file again
    disassociated_again = await crud_task_file_associations.disassociate_file_from_task(
        async_db_session,
        task_project_id=str(task.project_id),
        task_number=task.task_number,
        file_memory_entity_id=dummy_entity_1.id
    )
    assert disassociated_again is False

    # Disassociate the second file
    disassociated_second = await crud_task_file_associations.disassociate_file_from_task(
        async_db_session,
        task_project_id=str(task.project_id),
        task_number=task.task_number,
        file_memory_entity_id=dummy_entity_2.id
    )
    assert disassociated_second is True

    # Check that no files are associated now
    final_files = await crud_task_file_associations.get_files_for_task(async_db_session, task_project_id=str(task.project_id), task_number=task.task_number)
    assert len(final_files) == 0

    # Try disassociating from a non-existent task/file association
    disassociated_non_existent = await crud_task_file_associations.disassociate_file_from_task(
        async_db_session,
        task_project_id=str(uuid.uuid4()),
        task_number=9999,
        file_memory_entity_id=9999
    )
    assert disassociated_non_existent is False

# --- Task File Association CRUD Tests End --- 