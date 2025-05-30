# Project: project-manager

import pytest
# from sqlalchemy.orm import Session # Removed synchronous Session import
import uuid

# Import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

# Import models and schemas directly
from backend import models
# Import specific schemas
from .schemas.project import ProjectCreate, ProjectMemberCreate, ProjectMemberUpdate

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import project_members as crud_project_members

# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

# Helper function to create a project for testing other entities (ASYNC)
async def create_test_project(db: AsyncSession, name="Test Project") -> models.Project:
 project_schema = ProjectCreate(
 name=name, description="A test project")
 # Await the async CRUD function call
 return await crud_projects.create_project(db=db, project=project_schema)

# --- Project Member CRUD Tests ---


async def test_create_and_get_project_member(async_db_session: AsyncSession):
 # Use async_db_session and await
 project = await create_test_project(async_db_session, name="Member Project")
 # Assuming a create_test_user helper or similar is available in conftest or imported.
 # For now, using a dummy user ID string.
 user_id = str(uuid.uuid4())

 # Add a member (Await async CRUD call)
 member_data = ProjectMemberCreate(project_id=project.id, user_id=user_id, role="developer")
 db_member = await crud_project_members.add_project_member(
 async_db_session, project_member=member_data)
 assert db_member is not None
 assert str(db_member.project_id) == str(project.id)
 assert str(db_member.user_id) == str(user_id)
 assert db_member.role == "developer"

 # Get the member (Await async CRUD call)
 retrieved_member = await crud_project_members.get_project_member(
 async_db_session, project_id=project.id, user_id=user_id)
 assert retrieved_member is not None
 assert str(retrieved_member.project_id) == str(project.id)
 assert str(retrieved_member.user_id) == str(user_id)
 assert retrieved_member.role == "developer"


async def test_get_project_members_by_project(async_db_session: AsyncSession):
 # Use async_db_session and await
 project1 = await create_test_project(async_db_session, name="Members List Project 1")
 project2 = await create_test_project(async_db_session, name="Members List Project 2")
 user_id_1 = str(uuid.uuid4())
 user_id_2 = str(uuid.uuid4())
 user_id_3 = str(uuid.uuid4())

 # Add members to project 1 (Await async CRUD calls)
 member_data_1 = ProjectMemberCreate(project_id=project1.id, user_id=user_id_1, role="developer")
 member_data_2 = ProjectMemberCreate(project_id=project1.id, user_id=user_id_2, role="viewer")
 await crud_project_members.add_project_member(async_db_session, project_member=member_data_1)
 await crud_project_members.add_project_member(async_db_session, project_member=member_data_2)

 # Add a member to project 2 (Await async CRUD call)
 member_data_3 = ProjectMemberCreate(project_id=project2.id, user_id=user_id_3, role="owner")
 await crud_project_members.add_project_member(async_db_session, project_member=member_data_3)

 # Get members for project 1 (Await async CRUD call)
 project1_members = await crud_project_members.get_project_members(
 async_db_session, project_id=project1.id)
 assert len(project1_members) == 2
 user_ids_in_project1 = {str(member.user_id) for member in project1_members}
 assert user_id_1 in user_ids_in_project1
 assert user_id_2 in user_ids_in_project1

 # Get members for project 2 (Await async CRUD call)
 project2_members = await crud_project_members.get_project_members(
 async_db_session, project_id=project2.id)
 assert len(project2_members) == 1
 assert str(project2_members[0].user_id) == str(user_id_3)


async def test_remove_project_member(async_db_session: AsyncSession):
 # Use async_db_session and await
 project = await create_test_project(async_db_session, name="Remove Member Project")
 user_id_to_remove = str(uuid.uuid4())

 # Add the member (Await async CRUD call)
 member_data = ProjectMemberCreate(project_id=project.id, user_id=user_id_to_remove, role="developer")
 await crud_project_members.add_project_member(async_db_session, project_member=member_data)
 assert await crud_project_members.get_project_member(
 async_db_session, project_id=project.id, user_id=user_id_to_remove) is not None

 # Remove the member (Await async CRUD call)
 success = await crud_project_members.delete_project_member(
 async_db_session, project_id=project.id, user_id=user_id_to_remove)
 assert success is True
 assert await crud_project_members.get_project_member(
 async_db_session, project_id=project.id, user_id=user_id_to_remove) is None

 # Try removing a non-existent member (Await async CRUD call)
 success_not_found = await crud_project_members.delete_project_member(
 async_db_session, project_id=project.id, user_id=str(uuid.uuid4()))
 assert success_not_found is False


async def test_update_project_member_role(async_db_session: AsyncSession):
 # Use async_db_session and await
 project = await create_test_project(async_db_session, name="Update Role Project")
 user_id_to_update = str(uuid.uuid4())

 # Add the member with an initial role (Await async CRUD call)
 initial_member_data = ProjectMemberCreate(project_id=project.id, user_id=user_id_to_update, role="developer")
 await crud_project_members.add_project_member(async_db_session, project_member=initial_member_data)
 initial_member = await crud_project_members.get_project_member(
 async_db_session, project_id=project.id, user_id=user_id_to_update)
 assert initial_member is not None
 assert initial_member.role == "developer"

 # Update the member's role (Await async CRUD call)
 updated_role = "owner"
 updated_member = await crud_project_members.update_project_member(
 async_db_session, project_id=project.id, user_id=user_id_to_update, project_member_update=ProjectMemberUpdate(role=updated_role))
 assert updated_member is not None
 assert updated_member.role == updated_role
 assert str(updated_member.project_id) == str(project.id)
 assert str(updated_member.user_id) == str(user_id_to_update)

 # Verify role update in the database (Await async CRUD call)
 verified_member = await crud_project_members.get_project_member(
 async_db_session, project_id=project.id, user_id=user_id_to_update)
 assert verified_member is not None
 assert verified_member.role == updated_role

 # Try updating a non-existent member (Await async CRUD call)
 updated_non_existent = await crud_project_members.update_project_member(
 async_db_session, project_id=project.id, user_id=str(uuid.uuid4()), project_member_update=ProjectMemberUpdate(role="admin"))
 assert updated_non_existent is None

# --- Project Member CRUD Tests End --- 