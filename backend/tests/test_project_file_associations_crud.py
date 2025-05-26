# Task ID: 211
# Project: project-manager

import pytest
# from sqlalchemy.orm import Session # Removed synchronous Session import
import uuid

# Import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

# Import models and schemas directly
# Import models
from backend import models

# Import specific schemas as needed
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.schemas.memory import MemoryEntityCreate # Import MemoryEntityCreate

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import project_file_associations as crud_project_file_associations
from backend.crud import memory as memory_crud # Import memory_crud

# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

# Helper function to create a project for testing other entities (ASYNC)
async def create_test_project(db: AsyncSession, name="Test Project") -> models.Project:
    project_schema = ProjectCreate( # Corrected usage
        name=name, description="A test project")
    # Await the async CRUD function call
    return await crud_projects.create_project(db=db, project=project_schema)

# --- Project File Association CRUD Tests ---

async def test_create_and_get_project_file_association(async_db_session: AsyncSession):
    # Convert to async and use async_db_session
    project = await create_test_project(async_db_session, name="File Assoc Project")

    # Create dummy MemoryEntities for the test (Await async CRUD calls)
    dummy_entity_1_name = "file_for_proj_assoc_1"
    dummy_entity_2_name = "file_for_proj_assoc_2"
    dummy_entity_1 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_1_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await
    dummy_entity_2 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_2_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await

    # Use the generated IDs for associations and assertions

    # Associate file 1 (Await async CRUD call)
    association_data_1 = crud_project_file_associations.ProjectFileAssociationCreate(project_id=project.id, file_memory_entity_id=dummy_entity_1.id) # Corrected usage
    db_association_1 = await crud_project_file_associations.create_project_file_association(
        async_db_session, project_file=association_data_1)
    # Await commit if not automatically handled by create function (assuming it is handled based on previous fixes)
    # await async_db_session.commit()
    assert db_association_1 is not None
    assert str(db_association_1.project_id) == str(project.id)
    assert db_association_1.file_memory_entity_id == dummy_entity_1.id

    # Associate file 2 (Await async CRUD call)
    association_data_2 = crud_project_file_associations.ProjectFileAssociationCreate(project_id=project.id, file_memory_entity_id=dummy_entity_2.id) # Corrected usage
    db_association_2 = await crud_project_file_associations.create_project_file_association(
        async_db_session, project_file=association_data_2)
    # await async_db_session.commit()
    assert db_association_2 is not None
    assert str(db_association_2.project_id) == str(project.id)
    assert db_association_2.file_memory_entity_id == dummy_entity_2.id

    # Get association by project and file MemoryEntity ID (Await async CRUD call)
    retrieved_association = await crud_project_file_associations.get_project_file_association(
        async_db_session, project_id=project.id, file_memory_entity_id=dummy_entity_1.id)
    assert retrieved_association is not None
    assert str(retrieved_association.project_id) == str(project.id)
    assert retrieved_association.file_memory_entity_id == dummy_entity_1.id


async def test_get_project_file_association_not_found(async_db_session: AsyncSession):
    """Try getting a non-existent association."""
    # Convert to async and use async_db_session
    # Try getting a non-existent association (Await async CRUD call)
    # Use a dummy integer ID for file_memory_entity_id
    assert await crud_project_file_associations.get_project_file_association(
        async_db_session, project_id=str(uuid.uuid4()), file_memory_entity_id=9999) is None


async def test_get_files_for_project(async_db_session: AsyncSession):
    # Convert to async and use async_db_session
    project = await create_test_project(async_db_session, name="Project Files List Project")

    # Create dummy MemoryEntities for the test (Await async CRUD calls)
    dummy_entity_1_name = "file_for_proj_list_1"
    dummy_entity_2_name = "file_for_proj_list_2"
    dummy_entity_3_name = "file_for_other_proj"
    dummy_entity_1 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_1_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await
    dummy_entity_2 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_2_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await
    dummy_entity_3 = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_3_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await

    # Associate files with the project using the generated IDs (Await async CRUD calls)
    await crud_project_file_associations.associate_file_with_project(
        async_db_session, project_id=project.id, file_memory_entity_id=dummy_entity_1.id)
    await crud_project_file_associations.associate_file_with_project(
        async_db_session, project_id=project.id, file_memory_entity_id=dummy_entity_2.id)

    # Create a file associated with a different project (Await async CRUD call)
    other_project = await create_test_project(async_db_session, name="Other Project for Files")
    await crud_project_file_associations.associate_file_with_project(
        async_db_session, project_id=other_project.id, file_memory_entity_id=dummy_entity_3.id)

    # Get files for the main project (Await async CRUD call)
    project_files = await crud_project_file_associations.get_project_files(
        async_db_session, project_id=project.id)

    assert len(project_files) == 2
    # Check that the returned associations have the correct file_memory_entity_ids
    returned_file_ids = {assoc.file_memory_entity_id for assoc in project_files}
    assert returned_file_ids == {dummy_entity_1.id, dummy_entity_2.id}

    # Get files for the other project (Await async CRUD call)
    other_project_files = await crud_project_file_associations.get_project_files(
        async_db_session, project_id=other_project.id)
    assert len(other_project_files) == 1
    assert other_project_files[0].file_memory_entity_id == dummy_entity_3.id

    # Get files for a non-existent project (Await async CRUD call)
    non_existent_files = await crud_project_file_associations.get_project_files(
        async_db_session, project_id=str(uuid.uuid4()))
    assert len(non_existent_files) == 0


async def test_disassociate_file_from_project(async_db_session: AsyncSession):
    # Convert to async and use async_db_session
    project = await create_test_project(async_db_session, name="Disassociate File Project")
    # Create dummy MemoryEntities for the test (Await async CRUD calls)
    dummy_entity_to_disassociate_name = "file_for_proj_disassoc_1"
    dummy_entity_to_keep_name = "file_for_proj_disassoc_2"
    dummy_entity_to_disassociate = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_to_disassociate_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await
    dummy_entity_to_keep = await memory_crud.create_memory_entity(async_db_session, MemoryEntityCreate(type="file", name=dummy_entity_to_keep_name, description="", metadata_={}, entity_type="file")) # Added entity_type, Await

    # Use the generated IDs for associations and assertions
    file_memory_entity_id_to_disassociate = dummy_entity_to_disassociate.id
    file_memory_entity_id_to_keep = dummy_entity_to_keep.id

    # Associate files (Await async CRUD calls)
    await crud_project_file_associations.associate_file_with_project(
        async_db_session, project_id=project.id, file_memory_entity_id=file_memory_entity_id_to_disassociate)
    await crud_project_file_associations.associate_file_with_project(
        async_db_session, project_id=project.id, file_memory_entity_id=file_memory_entity_id_to_keep)

    # Ensure they are associated initially (Await async CRUD call)
    initial_files = await crud_project_file_associations.get_project_files(
        async_db_session, project_id=project.id)
    assert len(initial_files) == 2
    assert {assoc.file_memory_entity_id for assoc in initial_files} == {file_memory_entity_id_to_disassociate, file_memory_entity_id_to_keep}

    # Disassociate the first file (Await async CRUD call)
    success = await crud_project_file_associations.disassociate_file_from_project(
        async_db_session, project_id=project.id, file_memory_entity_id=file_memory_entity_id_to_disassociate)
    assert success is True

    # Check remaining files (Await async CRUD call)
    remaining_files = await crud_project_file_associations.get_project_files(
        async_db_session, project_id=project.id)
    assert len(remaining_files) == 1
    assert remaining_files[0].file_memory_entity_id == file_memory_entity_id_to_keep

    # Try disassociating the same file again (Await async CRUD call)
    success_again = await crud_project_file_associations.disassociate_file_from_project(
        async_db_session, project_id=project.id, file_memory_entity_id=file_memory_entity_id_to_disassociate)
    assert success_again is False

    # Disassociate the second file (Await async CRUD call)
    success_second = await crud_project_file_associations.disassociate_file_from_project(
        async_db_session, project_id=project.id, file_memory_entity_id=file_memory_entity_id_to_keep)
    assert success_second is True

    # Check remaining files (should be none) (Await async CRUD call)
    final_files = await crud_project_file_associations.get_project_files(
        async_db_session, project_id=project.id)
    assert len(final_files) == 0

    # Try disassociating from a non-existent project (Await async CRUD call)
    success_non_existent_project = await crud_project_file_associations.disassociate_file_from_project(
        async_db_session, project_id=str(uuid.uuid4()), file_memory_entity_id=file_memory_entity_id_to_disassociate)
    assert success_non_existent_project is False

    # Try disassociating a non-existent file from an existing project (Await async CRUD call)
    success_non_existent_file = await crud_project_file_associations.disassociate_file_from_project(
        async_db_session, project_id=project.id, file_memory_entity_id=9999)
    assert success_non_existent_file is False

# --- Project File Association CRUD Tests End ---