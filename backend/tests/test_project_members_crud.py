# Project: project-manager

import pytest
from sqlalchemy.orm import Session
import uuid

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import project_members as crud_project_members

# Helper function to create a project for testing other entities
def create_test_project(db: Session, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    return crud_projects.create_project(db=db, project=project_schema)

# --- Project Member CRUD Tests ---


def test_create_and_get_project_member(db_session: Session):
    project = create_test_project(db_session, name="Member Project")
    # Assuming a create_test_user helper or similar is available in conftest or imported.
    # For now, using a dummy user ID string.
    user_id = str(uuid.uuid4())

    # Add a member
    member_data = schemas.ProjectMemberCreate(project_id=project.id, user_id=user_id, role="developer")
    db_member = crud_project_members.add_project_member(
        db_session, project_member=member_data)
    assert db_member is not None
    assert str(db_member.project_id) == str(project.id)
    assert str(db_member.user_id) == str(user_id)
    assert db_member.role == "developer"

    # Get the member
    retrieved_member = crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id)
    assert retrieved_member is not None
    assert str(retrieved_member.project_id) == str(project.id)
    assert str(retrieved_member.user_id) == str(user_id)
    assert retrieved_member.role == "developer"


def test_get_project_members_by_project(db_session: Session):
    project1 = create_test_project(db_session, name="Members List Project 1")
    project2 = create_test_project(db_session, name="Members List Project 2")
    user_id_1 = str(uuid.uuid4())
    user_id_2 = str(uuid.uuid4())
    user_id_3 = str(uuid.uuid4())

    # Add members to project 1
    member_data_1 = schemas.ProjectMemberCreate(project_id=project1.id, user_id=user_id_1, role="developer")
    member_data_2 = schemas.ProjectMemberCreate(project_id=project1.id, user_id=user_id_2, role="viewer")
    crud_project_members.add_project_member(db_session, project_member=member_data_1)
    crud_project_members.add_project_member(db_session, project_member=member_data_2)

    # Add a member to project 2
    member_data_3 = schemas.ProjectMemberCreate(project_id=project2.id, user_id=user_id_3, role="owner")
    crud_project_members.add_project_member(db_session, project_member=member_data_3)

    # Get members for project 1
    project1_members = crud_project_members.get_project_members(
        db_session, project_id=project1.id)
    assert len(project1_members) == 2
    user_ids_in_project1 = {str(member.user_id) for member in project1_members}
    assert user_id_1 in user_ids_in_project1
    assert user_id_2 in user_ids_in_project1

    # Get members for project 2
    project2_members = crud_project_members.get_project_members(
        db_session, project_id=project2.id)
    assert len(project2_members) == 1
    assert str(project2_members[0].user_id) == str(user_id_3)


def test_remove_project_member(db_session: Session):
    project = create_test_project(db_session, name="Remove Member Project")
    user_id_to_remove = str(uuid.uuid4())

    # Add the member
    member_data = schemas.ProjectMemberCreate(project_id=project.id, user_id=user_id_to_remove, role="developer")
    crud_project_members.add_project_member(db_session, project_member=member_data)
    assert crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove) is not None

    # Remove the member
    success = crud_project_members.delete_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove)
    assert success is True
    assert crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove) is None

    # Try removing a non-existent member
    success_not_found = crud_project_members.delete_project_member(
        db_session, project_id=project.id, user_id=str(uuid.uuid4()))
    assert success_not_found is False


def test_update_project_member_role(db_session: Session):
    project = create_test_project(db_session, name="Update Role Project")
    user_id_to_update = str(uuid.uuid4())

    # Add the member with an initial role
    initial_member_data = schemas.ProjectMemberCreate(project_id=project.id, user_id=user_id_to_update, role="developer")
    crud_project_members.add_project_member(db_session, project_member=initial_member_data)
    initial_member = crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_update)
    assert initial_member is not None
    assert initial_member.role == "developer"

    # Update the member's role
    updated_role = "owner"
    updated_member = crud_project_members.update_project_member(
        db_session, project_id=project.id, user_id=user_id_to_update, project_member_update=schemas.ProjectMemberUpdate(role=updated_role))
    assert updated_member is not None
    assert updated_member.role == updated_role
    assert str(updated_member.project_id) == str(project.id)
    assert str(updated_member.user_id) == str(user_id_to_update)

    # Verify role update in the database
    verified_member = crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_update)
    assert verified_member is not None
    assert verified_member.role == updated_role

    # Try updating a non-existent member
    updated_non_existent = crud_project_members.update_project_member(
        db_session, project_id=project.id, user_id=str(uuid.uuid4()), project_member_update=schemas.ProjectMemberUpdate(role="admin"))
    assert updated_non_existent is None

# --- Project Member CRUD Tests End --- 