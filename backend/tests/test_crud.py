# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:40:00Z

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock  # Ensure mock is imported
import time
from fastapi import HTTPException

# Adjust imports based on project structure
# Assuming crud, models, schemas are in the parent directory
# from .. import crud, models, schemas # Removed

# Import models and schemas directly
from backend import models, schemas # Added

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects # Added
from backend.crud import tasks as crud_tasks # Added
from backend.crud import agents as crud_agents # Added
# from backend.crud import audit_logs as crud_audit_logs # Added
# from backend.crud import comments as crud_comments # Added
from backend.crud import project_members as crud_project_members # Added
from backend.crud import project_file_associations as crud_project_file_associations # Added
from backend.crud import task_file_associations as crud_task_file_associations # Added
from backend.crud import task_dependencies as crud_task_dependencies # Added

from .conftest import create_test_project, create_test_agent  # MODIFIED IMPORT

# Helper function to create a project for testing other entities


def create_test_project(db: Session, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    return crud_projects.create_project(db=db, project=project_schema)

# Helper function to create an agent for testing other entities


def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud_agents.create_agent(db=db, agent=agent_schema)


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
    crud_tasks.create_task(db_session, project_id, schemas.TaskCreate(
        title="Task 1 for Print Mock Test", project_id=project_id), agent_id=None)
    crud_tasks.create_task(db_session, project_id, schemas.TaskCreate(
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
    task1 = crud_tasks.create_task(db_session, project.id, schemas.TaskCreate(
        title="Task 1", project_id=project.id), agent_id=None)
    task2 = crud_tasks.create_task(db_session, project.id, schemas.TaskCreate(
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

# --- Agent CRUD Tests ---


def test_create_and_get_agent(db_session: Session):
    agent_schema = schemas.AgentCreate(name="Test Agent Alpha")
    db_agent = crud_agents.create_agent(db=db_session, agent=agent_schema)
    assert db_agent is not None
    assert db_agent.name == "Test Agent Alpha"
    assert db_agent.id is not None

    retrieved_agent = crud_agents.get_agent(db=db_session, agent_id=db_agent.id)
    assert retrieved_agent is not None
    assert retrieved_agent.id == db_agent.id

    retrieved_by_name = crud_agents.get_agent_by_name(
        db=db_session, name="Test Agent Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_agent.id


def test_get_agent_not_found(db_session: Session):
    # Test non-existent agent by ID
    assert crud_agents.get_agent(db=db_session, agent_id=8888) is None
    # Test non-existent agent by name
    assert crud_agents.get_agent_by_name(
        db=db_session, name="NonExistentAgent") is None
    # Test with None values
    assert crud_agents.get_agent(db=db_session, agent_id=None) is None
    assert crud_agents.get_agent_by_name(db=db_session, name=None) is None


def test_get_agents(db_session: Session):
    agents_before = crud_agents.get_agents(db=db_session)
    create_test_agent(db_session, name="Agent List Test 1")
    create_test_agent(db_session, name="Agent List Test 2")
    agents_after = crud_agents.get_agents(db=db_session)
    assert len(agents_after) == len(agents_before) + 2


def test_update_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Original Agent Name")
    update_data = schemas.AgentUpdate(name="Updated Agent Name")
    updated_agent = crud_agents.update_agent(
        db=db_session, agent_id=agent.id, agent_update=update_data)
    assert updated_agent is not None
    assert updated_agent.name == "Updated Agent Name"


def test_delete_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Agent To Delete")
    agent_id = agent.id
    deleted_agent = crud_agents.delete_agent(db=db_session, agent_id=agent_id)
    assert deleted_agent is not None
    assert deleted_agent.id == agent_id
    assert crud_agents.get_agent(db=db_session, agent_id=agent_id) is None


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
        db_session, project_id=project.id, task=task_schema)
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

    crud_tasks.create_task(db_session, crud_tasks.schemas.TaskCreate(
        title="P1 Task 1"), project_id=project1_id)
    crud_tasks.create_task(db_session, crud_tasks.schemas.TaskCreate(
        title="P1 Task 2"), project_id=project1_id)
    crud_tasks.create_task(db_session, crud_tasks.schemas.TaskCreate(
        title="P2 Task 1"), project_id=project2_id)

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
    task = crud_tasks.create_task(db_session, crud_tasks.schemas.TaskCreate(
        title="Task to Update"), project_id=project_id)
    task_project_id = task.project_id
    task_number = task.task_number

    update_data = crud_tasks.schemas.TaskUpdate(
        title="Updated Task Title", status="Done", is_archived=True)

    # Assuming update_task takes project_id and task_number
    # Based on tasks.py signature, it takes task_id (UUID string). Need to clarify the task ID strategy.
    # Using get_task_by_project_and_number to get the task by composite key, then update using its ID.
    task_to_update = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=task_project_id, task_number=task_number)
    # Assuming task has a UUID 'id' field
    updated_task = crud_tasks.update_task(
        db=db_session, task_id=task_to_update.id, task=update_data)

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
    project_id = project.id
    task = crud_tasks.create_task(db_session, crud_tasks.schemas.TaskCreate(
        title="Task to Delete"), project_id=project_id)
    task_project_id = task.project_id
    task_number = task.task_number

    # Assuming delete_task takes task_id (UUID string)
    # Using get_task_by_project_and_number to get the task by composite key, then delete using its ID.
    task_to_delete = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=task_project_id, task_number=task_number)
    # Assuming task has a UUID 'id' field
    deleted_task = crud_tasks.delete_task(
        db=db_session, task_id=task_to_delete.id)

    assert deleted_task is not None
    assert deleted_task.project_id == task_project_id
    assert deleted_task.task_number == task_number

    retrieved_task = crud_tasks.get_task_by_project_and_number(
        db_session, project_id=task_project_id, task_number=task_number)
    assert retrieved_task is None

# --- Relationships Tests ---
# (Assuming relationship tests will be added here later, e.g., for TaskDependency)


# def test_create_and_get_audit_log_entry(db_session: Session):
#     # Create a log entry
#     log_entry_data = crud_projects.schemas.AuditLogCreate(
#         entity_type="project",
#         entity_id=str(uuid.uuid4()),
#         action="created",
#         user_id=str(uuid.uuid4()),
#         details={"name": "Test Project"}
#     )
#     db_log_entry = crud_projects.create_audit_log_entry(
#         db_session, log_entry_data)
#     assert db_log_entry is not None
#     assert db_log_entry.entity_type == log_entry_data.entity_type
#     assert db_log_entry.entity_id == log_entry_data.entity_id
#     assert db_log_entry.action == log_entry_data.action
#     assert db_log_entry.user_id == log_entry_data.user_id
#     assert db_log_entry.details == log_entry_data.details
#     assert db_log_entry.id is not None
#     assert db_log_entry.timestamp is not None

#     # Get the log entry by ID
#     retrieved_log_entry = crud_projects.get_audit_log_entry(
#         db_session, db_log_entry.id)
#     assert retrieved_log_entry is not None
#     assert retrieved_log_entry.id == db_log_entry.id
#     assert retrieved_log_entry.entity_type == log_entry_data.entity_type


# def test_get_audit_log_entry_not_found(db_session: Session):
#     # Try getting a non-existent log entry by ID
#     assert crud_projects.get_audit_log_entry(
#         db_session, str(uuid.uuid4())) is None


# def test_get_audit_log_entries_by_entity(db_session: Session):
#     entity_id_1 = str(uuid.uuid4())
#     entity_id_2 = str(uuid.uuid4())
#     user_id_1 = str(uuid.uuid4())

#     # Create log entries for entity 1
#     log1_e1 = crud_projects.create_audit_log_entry(db_session, crud_projects.schemas.AuditLogCreate(
#         entity_type="project", entity_id=entity_id_1, action="created", user_id=user_id_1, details={}))
#     log2_e1 = crud_projects.create_audit_log_entry(db_session, crud_projects.schemas.AuditLogCreate(
#         entity_type="project", entity_id=entity_id_1, action="updated", user_id=user_id_1, details={}))

#     # Create a log entry for entity 2
#     log3_e2 = crud_projects.create_audit_log_entry(db_session, crud_projects.schemas.AuditLogCreate(
#         entity_type="task", entity_id=entity_id_2, action="created", user_id=user_id_1, details={}))

#     # Get log entries for entity 1
#     entity1_logs = crud_projects.get_audit_log_entries_by_entity(
#         db_session, "project", entity_id_1)
#     assert len(entity1_logs) == 2
#     assert {log.action for log in entity1_logs} == {"created", "updated"}

#     # Get log entries for entity 2
#     entity2_logs = crud_projects.get_audit_log_entries_by_entity(
#         db_session, "task", entity_id_2)
#     assert len(entity2_logs) == 1
#     assert entity2_logs[0].action == "created"

#     # Get log entries for a non-existent entity
#     non_existent_entity_logs = crud_projects.get_audit_log_entries_by_entity(
#         db_session, "project", str(uuid.uuid4()))
#     assert len(non_existent_entity_logs) == 0


# def test_get_audit_log_entries_by_user(db_session: Session):
#     user_id_1 = str(uuid.uuid4())
#     user_id_2 = str(uuid.uuid4())
#     entity_id_1 = str(uuid.uuid4())
#     entity_id_2 = str(uuid.uuid4())

#     # Create log entries for user 1
#     log1_u1 = crud_projects.create_audit_log_entry(db_session, crud_projects.schemas.AuditLogCreate(
#         entity_type="project", entity_id=entity_id_1, action="created", user_id=user_id_1, details={}))
#     log2_u1 = crud_projects.create_audit_log_entry(db_session, crud_projects.schemas.AuditLogCreate(
#         entity_type="task", entity_id=entity_id_2, action="updated", user_id=user_id_1, details={}))

#     # Create a log entry for user 2
#     log3_u2 = crud_projects.create_audit_log_entry(db_session, crud_projects.schemas.AuditLogCreate(
#         entity_type="project", entity_id=entity_id_1, action="deleted", user_id=user_id_2, details={}))

#     # Get log entries for user 1
#     user1_logs = crud_projects.get_audit_log_entries_by_user(
#         db_session, user_id_1)
#     assert len(user1_logs) == 2
#     assert {log.action for log in user1_logs} == {"created", "updated"}

#     # Get log entries for user 2
#     user2_logs = crud_projects.get_audit_log_entries_by_user(
#         db_session, user_id_2)
#     assert len(user2_logs) == 1
#     assert user2_logs[0].action == "deleted"

#     # Get log entries for a non-existent user
#     non_existent_user_logs = crud_projects.get_audit_log_entries_by_user(
#         db_session, str(uuid.uuid4()))
#     assert len(non_existent_user_logs) == 0

# --- End of Audit Log CRUD Tests ---

# --- Project Member CRUD Tests ---


def test_create_and_get_project_member(db_session: Session):
    project = create_test_project(db_session, name="Member Project")
    # Assuming a create_test_user helper or similar is available in conftest or imported.
    # For now, using a dummy user ID string.
    user_id = str(uuid.uuid4())

    # Add a member
    db_member = crud_project_members.add_project_member(
        db_session, project_id=project.id, user_id=user_id, role="developer")
    assert db_member is not None
    assert db_member.project_id == project.id
    assert db_member.user_id == user_id
    assert db_member.role == "developer"

    # Get the member
    retrieved_member = crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id)
    assert retrieved_member is not None
    assert retrieved_member.project_id == project.id
    assert retrieved_member.user_id == user_id
    assert retrieved_member.role == "developer"


def test_get_project_member_not_found(db_session: Session):
    # Try getting a non-existent member
    assert crud_project_members.get_project_member(db_session, project_id=str(
        uuid.uuid4()), user_id=str(uuid.uuid4())) is None


def test_get_project_members_by_project(db_session: Session):
    project1 = create_test_project(db_session, name="Members List Project 1")
    project2 = create_test_project(db_session, name="Members List Project 2")
    user_id_1 = str(uuid.uuid4())
    user_id_2 = str(uuid.uuid4())

    # Add members to project 1
    crud_project_members.add_project_member(
        db_session, project_id=project1.id, user_id=user_id_1, role="developer")
    crud_project_members.add_project_member(
        db_session, project_id=project1.id, user_id=user_id_2, role="reporter")

    # Add a member to project 2
    crud_project_members.add_project_member(
        db_session, project_id=project2.id, user_id=user_id_1, role="maintainer")

    # Get members for project 1
    project1_members = crud_project_members.get_project_members_by_project(
        db_session, project_id=project1.id)
    assert len(project1_members) == 2
    assert {member.user_id for member in project1_members} == {
        user_id_1, user_id_2}

    # Get members for project 2
    project2_members = crud_project_members.get_project_members_by_project(
        db_session, project_id=project2.id)
    assert len(project2_members) == 1
    assert project2_members[0].user_id == user_id_1

    # Get members for a non-existent project
    non_existent_project_members = crud_project_members.get_project_members_by_project(
        db_session, project_id=str(uuid.uuid4()))
    assert len(non_existent_project_members) == 0


def test_remove_project_member(db_session: Session):
    project = create_test_project(db_session, name="Remove Member Project")
    user_id_to_remove = str(uuid.uuid4())

    # Add the member
    crud_project_members.add_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove, role="developer")
    assert crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove) is not None

    # Remove the member
    success = crud_project_members.remove_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove)
    assert success is True
    assert crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_remove) is None

    # Try removing a non-existent member
    success_not_found = crud_project_members.remove_project_member(
        db_session, project_id=project.id, user_id=str(uuid.uuid4()))
    assert success_not_found is False


def test_update_project_member_role(db_session: Session):
    project = create_test_project(db_session, name="Update Role Project")
    user_id_to_update = str(uuid.uuid4())

    # Add the member with an initial role
    crud_project_members.add_project_member(
        db_session, project_id=project.id, user_id=user_id_to_update, role="developer")
    initial_member = crud_project_members.get_project_member(
        db_session, project_id=project.id, user_id=user_id_to_update)
    assert initial_member.role == "developer"

    # Update the member's role
    updated_member = crud_project_members.update_project_member_role(
        db_session, project_id=project.id, user_id=user_id_to_update, new_role="maintainer")
    assert updated_member is not None
    assert updated_member.role == "maintainer"

    # Try updating role for a non-existent member
    updated_member_not_found = crud_project_members.update_project_member_role(
        db_session, project_id=project.id, user_id=str(uuid.uuid4()), new_role="admin")
    assert updated_member_not_found is None


# --- Project File Association CRUD Tests ---

def test_create_and_get_project_file_association(db_session: Session):
    project = create_test_project(db_session, name="File Assoc Project")
    # Assuming a create_test_file helper or similar is available.
    # For now, using dummy file ID strings.
    file_id_1 = str(uuid.uuid4())
    file_id_2 = str(uuid.uuid4())

    # Associate file 1
    db_association_1 = crud_project_file_associations.associate_file_with_project(
        db_session, project_id=project.id, file_id=file_id_1)
    assert db_association_1 is not None
    assert db_association_1.project_id == project.id
    assert db_association_1.file_id == file_id_1

    # Associate file 2
    db_association_2 = crud_project_file_associations.associate_file_with_project(
        db_session, project_id=project.id, file_id=file_id_2)
    assert db_association_2 is not None
    assert db_association_2.project_id == project.id
    assert db_association_2.file_id == file_id_2

    # Get association by project and file ID
    retrieved_association = crud_project_file_associations.get_project_file_association(
        db_session, project_id=project.id, file_id=file_id_1)
    assert retrieved_association is not None
    assert retrieved_association.project_id == project.id
    assert retrieved_association.file_id == file_id_1


def test_get_project_file_association_not_found(db_session: Session):
    # Try getting a non-existent association
    assert crud_project_file_associations.get_project_file_association(
        db_session, project_id=str(uuid.uuid4()), file_id=str(uuid.uuid4())) is None


def test_get_dependencies_for_task(db_session: Session):
    project = create_test_project(
        db_session, name="Task Dependencies List Project")
    task1_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 1 for Dep List", project_id=project.id)
    task2_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 2 for Dep List", project_id=project.id)
    task3_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 3 for Dep List", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)
    task3 = crud_tasks.create_task(db_session, project.id, task3_create_schema)

    # Add dependencies: T1 -> T2, T1 -> T3, T2 -> T3
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task3.task_number)
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task2.task_number, uuid.UUID(project.id), task3.task_number)

    # Get dependencies for Task 1 (should be T1 -> T2, T1 -> T3)
    task1_deps = crud_tasks.get_dependencies_for_task(
        db_session, uuid.UUID(project.id), task1.task_number)
    assert len(task1_deps) == 2
    assert {dep.successor_task_number for dep in task1_deps} == {
        task2.task_number, task3.task_number}

    # Get dependencies for Task 2 (should be T1 -> T2)
    task2_deps = crud_tasks.get_dependencies_for_task(
        db_session, uuid.UUID(project.id), task2.task_number)
    # This should include T1->T2 (where task2 is successor) and T2->T3 (where task2 is predecessor) - assuming the CRUD function gets both.
    assert len(task2_deps) == 2
    task2_related_task_numbers = {dep.predecessor_task_number if dep.successor_task_number ==
                                  task2.task_number else dep.successor_task_number for dep in task2_deps}
    assert task1.task_number in task2_related_task_numbers  # T1 is a predecessor
    assert task3.task_number in task2_related_task_numbers  # T3 is a successor

    # Get dependencies for Task 3 (should be T1 -> T3, T2 -> T3)
    task3_deps = crud_tasks.get_dependencies_for_task(
        db_session, uuid.UUID(project.id), task3.task_number)
    assert len(task3_deps) == 2
    assert {dep.predecessor_task_number for dep in task3_deps} == {
        task1.task_number, task2.task_number}

    # Get dependencies for a non-existent task
    non_existent_task_deps = crud_tasks.get_dependencies_for_task(
        db_session, uuid.uuid4(), 999)
    assert len(non_existent_task_deps) == 0


def test_get_predecessor_tasks(db_session: Session):
    project = create_test_project(db_session, name="Predecessor Project")
    task1_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 1 for Pred", project_id=project.id)
    task2_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 2 for Pred", project_id=project.id)
    task3_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 3 for Pred", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)
    task3 = crud_tasks.create_task(db_session, project.id, task3_create_schema)

    # Add dependencies: T1 -> T3, T2 -> T3
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task3.task_number)
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task2.task_number, uuid.UUID(project.id), task3.task_number)

    # Get predecessors for Task 3
    task3_predecessors = crud_tasks.get_predecessor_tasks(
        db_session, uuid.UUID(project.id), task3.task_number)
    assert len(task3_predecessors) == 2
    assert {dep.predecessor_task_number for dep in task3_predecessors} == {
        task1.task_number, task2.task_number}

    # Get predecessors for Task 1 (none)
    task1_predecessors = crud_tasks.get_predecessor_tasks(
        db_session, uuid.UUID(project.id), task1.task_number)
    assert len(task1_predecessors) == 0

    # Get predecessors for a non-existent task
    non_existent_task_predecessors = crud_tasks.get_predecessor_tasks(
        db_session, uuid.uuid4(), 999)
    assert len(non_existent_task_predecessors) == 0


def test_get_successor_tasks(db_session: Session):
    project = create_test_project(db_session, name="Successor Project")
    task1_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 1 for Succ", project_id=project.id)
    task2_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 2 for Succ", project_id=project.id)
    task3_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 3 for Succ", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)
    task3 = crud_tasks.create_task(db_session, project.id, task3_create_schema)

    # Add dependencies: T1 -> T2, T1 -> T3
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    crud_tasks.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task3.task_number)

    # Get successors for Task 1
    task1_successors = crud_tasks.get_successor_tasks(
        db_session, uuid.UUID(project.id), task1.task_number)
    assert len(task1_successors) == 2
    assert {dep.successor_task_number for dep in task1_successors} == {
        task2.task_number, task3.task_number}

    # Get successors for Task 2 (none)
    task2_successors = crud_tasks.get_successor_tasks(
        db_session, uuid.UUID(project.id), task2.task_number)
    assert len(task2_successors) == 0

    # Get successors for a non-existent task
    non_existent_task_successors = crud_tasks.get_successor_tasks(
        db_session, uuid.uuid4(), 999)


def test_get_files_for_project(db_session: Session):
    project1 = create_test_project(db_session, name="Project Files List 1")
    project2 = create_test_project(db_session, name="Project Files List 2")
    file_id_1 = str(uuid.uuid4())
    file_id_2 = str(uuid.uuid4())
    file_id_3 = str(uuid.uuid4())

    # Associate files with project 1
    crud_project_file_associations.associate_file_with_project(
        db_session, project_id=project1.id, file_id=file_id_1)
    crud_project_file_associations.associate_file_with_project(
        db_session, project_id=project1.id, file_id=file_id_2)

    # Associate a file with project 2
    crud_project_file_associations.associate_file_with_project(
        db_session, project_id=project2.id, file_id=file_id_3)

    # Get files for project 1
    project1_files = crud_project_file_associations.get_files_for_project(
        db_session, project_id=project1.id)
    assert len(project1_files) == 2
    assert {assoc.file_id for assoc in project1_files} == {
        file_id_1, file_id_2}

    # Get files for project 2
    project2_files = crud_project_file_associations.get_files_for_project(
        db_session, project_id=project2.id)
    assert len(project2_files) == 1
    assert project2_files[0].file_id == file_id_3

    # Get files for a non-existent project
    non_existent_project_files = crud_project_file_associations.get_files_for_project(
        db_session, project_id=str(uuid.uuid4()))
    assert len(non_existent_project_files) == 0


def test_disassociate_file_from_project(db_session: Session):
    project = create_test_project(db_session, name="Disassociate File Project")
    file_id_to_disassociate = str(uuid.uuid4())

    # Associate the file
    crud_project_file_associations.associate_file_with_project(
        db_session, project_id=project.id, file_id=file_id_to_disassociate)
    assert crud_project_file_associations.get_project_file_association(
        db_session, project_id=project.id, file_id=file_id_to_disassociate) is not None

    # Disassociate the file
    success = crud_project_file_associations.disassociate_file_from_project(
        db_session, project_id=project.id, file_id=file_id_to_disassociate)
    assert success is True
    assert crud_project_file_associations.get_project_file_association(
        db_session, project_id=project.id, file_id=file_id_to_disassociate) is None

    # Try disassociating a non-existent association
    success_not_found = crud_project_file_associations.disassociate_file_from_project(
        db_session, project_id=project.id, file_id=str(uuid.uuid4()))
    assert success_not_found is False


# --- Task File Association CRUD Tests ---

def test_create_and_get_task_file_association(db_session: Session):
    project = create_test_project(db_session, name="Task File Assoc Project")
    # Assuming create_test_task helper or similar is available.
    # Using crud directly for task creation.
    task_create_schema = schemas.TaskCreate(
        title="Task for File Assoc", project_id=project.id)
    task = crud_tasks.create_task(db_session, project.id, task_create_schema)

    # Assuming a create_test_file helper or similar is available.
    # For now, using dummy file ID strings.
    file_id_1 = str(uuid.uuid4())
    file_id_2 = str(uuid.uuid4())

    # Associate file 1
    db_association_1 = crud_task_file_associations.associate_file_with_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_1)
    assert db_association_1 is not None
    assert db_association_1.task_project_id == project.id
    assert db_association_1.task_number == task.task_number
    assert db_association_1.file_id == file_id_1

    # Associate file 2
    db_association_2 = crud_task_file_associations.associate_file_with_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_2)
    assert db_association_2 is not None
    assert db_association_2.task_project_id == project.id
    assert db_association_2.task_number == task.task_number
    assert db_association_2.file_id == file_id_2

    # Get association by task and file ID
    retrieved_association = crud_task_file_associations.get_task_file_association(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_1)
    assert retrieved_association is not None
    assert retrieved_association.task_project_id == project.id
    assert retrieved_association.task_number == task.task_number
    assert retrieved_association.file_id == file_id_1


def test_get_task_file_association_not_found(db_session: Session):
    # Try getting a non-existent association
    assert crud_task_file_associations.get_task_file_association(db_session, task_project_id=uuid.uuid4(
    ), task_number=999, file_id=str(uuid.uuid4())) is None


def test_get_files_for_task(db_session: Session):
    project = create_test_project(db_session, name="Task Files List Project")
    task1_create_schema = schemas.TaskCreate(
        title="Task 1 for File List", project_id=project.id)
    task2_create_schema = schemas.TaskCreate(
        title="Task 2 for File List", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)

    file_id_1 = str(uuid.uuid4())
    file_id_2 = str(uuid.uuid4())
    file_id_3 = str(uuid.uuid4())

    # Associate files with task 1
    crud_task_file_associations.associate_file_with_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task1.task_number, file_id=file_id_1)
    crud_task_file_associations.associate_file_with_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task1.task_number, file_id=file_id_2)

    # Associate a file with task 2
    crud_task_file_associations.associate_file_with_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task2.task_number, file_id=file_id_3)

    # Get files for task 1
    task1_files = crud_task_file_associations.get_files_for_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task1.task_number)
    assert len(task1_files) == 2
    assert {assoc.file_id for assoc in task1_files} == {file_id_1, file_id_2}

    # Get files for task 2
    task2_files = crud_task_file_associations.get_files_for_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task2.task_number)
    assert len(task2_files) == 1
    assert task2_files[0].file_id == file_id_3

    # Get files for a non-existent task
    non_existent_task_files = crud_task_file_associations.get_files_for_task(
        db_session, task_project_id=uuid.uuid4(), task_number=999)
    assert len(non_existent_task_files) == 0


def test_disassociate_file_from_task(db_session: Session):
    project = create_test_project(
        db_session, name="Disassociate Task File Project")
    task_create_schema = schemas.TaskCreate(
        title="Task for File Disassoc", project_id=project.id)
    task = crud_tasks.create_task(db_session, project.id, task_create_schema)
    file_id_to_disassociate = str(uuid.uuid4())

    # Associate the file
    crud_task_file_associations.associate_file_with_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_to_disassociate)
    assert crud_task_file_associations.get_task_file_association(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_to_disassociate) is not None

    # Disassociate the file
    success = crud_task_file_associations.disassociate_file_from_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_to_disassociate)
    assert success is True
    assert crud_task_file_associations.get_task_file_association(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=file_id_to_disassociate) is None

    # Try disassociating a non-existent association
    success_not_found = crud_task_file_associations.disassociate_file_from_task(db_session, task_project_id=uuid.UUID(
        project.id), task_number=task.task_number, file_id=str(uuid.uuid4()))
    assert success_not_found is False


# --- Task Dependency CRUD Tests ---

def test_create_and_get_task_dependency(db_session: Session):
    project = create_test_project(db_session, name="Dependency Project")
    # Using crud directly for task creation.
    task1_create_schema = schemas.TaskCreate(
        title="Task 1 for Dep", project_id=project.id)
    task2_create_schema = schemas.TaskCreate(
        title="Task 2 for Dep", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)

    # Add dependency: Task 1 -> Task 2
    db_dependency = crud_task_dependencies.add_task_dependency(
        db_session,
        predecessor_task_project_id=uuid.UUID(project.id),
        predecessor_task_number=task1.task_number,
        successor_task_project_id=uuid.UUID(project.id),
        successor_task_number=task2.task_number
    )
    assert db_dependency is not None
    assert db_dependency.predecessor_task_project_id == project.id
    assert db_dependency.predecessor_task_number == task1.task_number
    assert db_dependency.successor_task_project_id == project.id
    assert db_dependency.successor_task_number == task2.task_number

    # Get the dependency
    retrieved_dependency = crud_task_dependencies.get_task_dependency(
        db_session,
        predecessor_task_project_id=uuid.UUID(project.id),
        predecessor_task_number=task1.task_number,
        successor_task_project_id=uuid.UUID(project.id),
        successor_task_number=task2.task_number
    )
    assert retrieved_dependency is not None
    assert retrieved_dependency.predecessor_task_project_id == project.id
    assert retrieved_dependency.predecessor_task_number == task1.task_number
    assert retrieved_dependency.successor_task_project_id == project.id
    assert retrieved_dependency.successor_task_number == task2.task_number


def test_get_task_dependency_not_found(db_session: Session):
    # Try getting a non-existent dependency
    assert crud_task_dependencies.get_task_dependency(
        db_session,
        predecessor_task_project_id=uuid.uuid4(),
        predecessor_task_number=999,
        successor_task_project_id=uuid.uuid4(),
        successor_task_number=888
    ) is None


def test_get_dependencies_for_task(db_session: Session):
    project = create_test_project(
        db_session, name="Task Dependencies List Project")
    task1_create_schema = schemas.TaskCreate(
        title="Task 1 for Dep List", project_id=project.id)
    task2_create_schema = schemas.TaskCreate(
        title="Task 2 for Dep List", project_id=project.id)
    task3_create_schema = schemas.TaskCreate(
        title="Task 3 for Dep List", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)
    task3 = crud_tasks.create_task(db_session, project.id, task3_create_schema)

    # Add dependencies: T1 -> T2, T1 -> T3, T2 -> T3
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task3.task_number)
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task2.task_number, uuid.UUID(project.id), task3.task_number)

    # Get dependencies for Task 1 (should be T1 -> T2, T1 -> T3)
    task1_deps = crud_task_dependencies.get_dependencies_for_task(
        db_session, uuid.UUID(project.id), task1.task_number)
    assert len(task1_deps) == 2
    assert {dep.successor_task_number for dep in task1_deps} == {
        task2.task_number, task3.task_number}

    # Get dependencies for Task 2 (should be T1 -> T2)
    task2_deps = crud_task_dependencies.get_dependencies_for_task(
        db_session, uuid.UUID(project.id), task2.task_number)
    # This should include T1->T2 (where task2 is successor) and T2->T3 (where task2 is predecessor) - assuming the CRUD function gets both.
    assert len(task2_deps) == 2
    task2_related_task_numbers = {dep.predecessor_task_number if dep.successor_task_number ==
                                  task2.task_number else dep.successor_task_number for dep in task2_deps}
    assert task1.task_number in task2_related_task_numbers  # T1 is a predecessor
    assert task3.task_number in task2_related_task_numbers  # T3 is a successor

    # Get dependencies for Task 3 (should be T1 -> T3, T2 -> T3)
    task3_deps = crud_task_dependencies.get_dependencies_for_task(
        db_session, uuid.UUID(project.id), task3.task_number)
    assert len(task3_deps) == 2
    assert {dep.predecessor_task_number for dep in task3_deps} == {
        task1.task_number, task2.task_number}

    # Get dependencies for a non-existent task
    non_existent_task_deps = crud_task_dependencies.get_dependencies_for_task(
        db_session, uuid.uuid4(), 999)
    assert len(non_existent_task_deps) == 0


def test_get_predecessor_tasks(db_session: Session):
    project = create_test_project(db_session, name="Predecessor Project")
    task1_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 1 for Pred", project_id=project.id)
    task2_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 2 for Pred", project_id=project.id)
    task3_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 3 for Pred", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)
    task3 = crud_tasks.create_task(db_session, project.id, task3_create_schema)

    # Add dependencies: T1 -> T3, T2 -> T3
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task3.task_number)
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task2.task_number, uuid.UUID(project.id), task3.task_number)

    # Get predecessors for Task 3
    task3_predecessors = crud_task_dependencies.get_predecessor_tasks(
        db_session, uuid.UUID(project.id), task3.task_number)
    assert len(task3_predecessors) == 2
    assert {dep.predecessor_task_number for dep in task3_predecessors} == {
        task1.task_number, task2.task_number}

    # Get predecessors for Task 1 (none)
    task1_predecessors = crud_task_dependencies.get_predecessor_tasks(
        db_session, uuid.UUID(project.id), task1.task_number)
    assert len(task1_predecessors) == 0

    # Get predecessors for a non-existent task
    non_existent_task_predecessors = crud_task_dependencies.get_predecessor_tasks(
        db_session, uuid.uuid4(), 999)
    assert len(non_existent_task_predecessors) == 0


def test_get_successor_tasks(db_session: Session):
    project = create_test_project(db_session, name="Successor Project")
    task1_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 1 for Succ", project_id=project.id)
    task2_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 2 for Succ", project_id=project.id)
    task3_create_schema = crud_tasks.schemas.TaskCreate(
        title="Task 3 for Succ", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)
    task3 = crud_tasks.create_task(db_session, project.id, task3_create_schema)

    # Add dependencies: T1 -> T2, T1 -> T3
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task3.task_number)

    # Get successors for Task 1
    task1_successors = crud_task_dependencies.get_successor_tasks(
        db_session, uuid.UUID(project.id), task1.task_number)
    assert len(task1_successors) == 2
    assert {dep.successor_task_number for dep in task1_successors} == {
        task2.task_number, task3.task_number}

    # Get successors for Task 2 (none)
    task2_successors = crud_task_dependencies.get_successor_tasks(
        db_session, uuid.UUID(project.id), task2.task_number)
    assert len(task2_successors) == 0

    # Get successors for a non-existent task
    non_existent_task_successors = crud_task_dependencies.get_successor_tasks(
        db_session, uuid.uuid4(), 999)
    assert len(non_existent_task_successors) == 0


def test_remove_task_dependency(db_session: Session):
    project = create_test_project(db_session, name="Remove Dependency Project")
    task1_create_schema = schemas.TaskCreate(
        title="Task 1 for Remove Dep", project_id=project.id)
    task2_create_schema = schemas.TaskCreate(
        title="Task 2 for Remove Dep", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)

    # Add dependency: Task 1 -> Task 2
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    assert crud_task_dependencies.get_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number) is not None

    # Remove the dependency
    success = crud_task_dependencies.remove_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    assert success is True
    assert crud_task_dependencies.get_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number) is None

    # Try removing a non-existent dependency
    success_not_found = crud_task_dependencies.remove_task_dependency(db_session, uuid.UUID(
        # Use same IDs as removed
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)
    assert success_not_found is False


def test_add_task_dependency_circular(db_session: Session):
    project = create_test_project(
        db_session, name="Circular Dependency Project")
    task1_create_schema = schemas.TaskCreate(
        title="Task 1 for Circular", project_id=project.id)
    task2_create_schema = schemas.TaskCreate(
        title="Task 2 for Circular", project_id=project.id)
    task1 = crud_tasks.create_task(db_session, project.id, task1_create_schema)
    task2 = crud_tasks.create_task(db_session, project.id, task2_create_schema)

    # Add dependency: T1 -> T2
    crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
        project.id), task1.task_number, uuid.UUID(project.id), task2.task_number)

    # Try adding dependency: T2 -> T1 (should raise HTTPException for circular dependency)
    with pytest.raises(HTTPException) as excinfo:
        crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
            project.id), task2.task_number, uuid.UUID(project.id), task1.task_number)
    assert excinfo.value.status_code == 400
    assert "Circular dependency detected" in excinfo.value.detail


def test_add_task_dependency_self(db_session: Session):
    project = create_test_project(db_session, name="Self Dependency Project")
    task_create_schema = schemas.TaskCreate(
        title="Task for Self Dep", project_id=project.id)
    task = crud_tasks.create_task(db_session, project.id, task_create_schema)

    # Try adding dependency: Task -> Task (should raise HTTPException)
    with pytest.raises(HTTPException) as excinfo:
        crud_task_dependencies.add_task_dependency(db_session, uuid.UUID(
            project.id), task.task_number, uuid.UUID(project.id), task.task_number)
    assert excinfo.value.status_code == 400
    assert "A task cannot be dependent on itself" in excinfo.value.detail


def test_delete_task(db_session: Session):
    project = create_test_project(db_session)
    task = crud_tasks.create_task(db_session, project_id=project.id, task=schemas.TaskCreate(
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


# Note: test_delete_project_with_tasks_and_mock_print and test_delete_project_prints_task_count
# already indirectly test task deletion via project cascade and seem to use project_id, so they might not need significant changes for this specific task PK refactor.

# def test_create_and_get_comment(db_session: Session):
#     # Ensure test setup for comment requires a task and user
#     ... existing code ...
