# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:40:00Z

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock # Ensure mock is imported
import time

# Adjust imports based on project structure
from .. import crud, models, schemas # Assuming crud, models, schemas are in the parent directory
from .conftest import create_test_project, create_test_agent # MODIFIED IMPORT

# Helper function to create a project for testing other entities
def create_test_project(db: Session, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(name=name, description="A test project")
    return crud.create_project(db=db, project=project_schema)

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud.create_agent(db=db, agent=agent_schema)


# --- Project CRUD Tests ---
def test_create_and_get_project(db_session: Session):
    project_schema = schemas.ProjectCreate(name="Test Project Alpha", description="Alpha Test Description")
    db_project = crud.create_project(db=db_session, project=project_schema)
    assert db_project is not None
    assert db_project.name == "Test Project Alpha"
    assert db_project.description == "Alpha Test Description"
    assert db_project.id is not None

    retrieved_project = crud.get_project(db=db_session, project_id=db_project.id)
    assert retrieved_project is not None
    assert retrieved_project.id == db_project.id
    assert retrieved_project.name == "Test Project Alpha"

    retrieved_by_name = crud.get_project_by_name(db=db_session, name="Test Project Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_project.id

def test_get_project_not_found(db_session: Session):
    retrieved_project = crud.get_project(db=db_session, project_id=9999)
    assert retrieved_project is None
    retrieved_by_name = crud.get_project_by_name(db=db_session, name="NonExistentProject")
    assert retrieved_by_name is None

def test_get_projects(db_session: Session):
    projects_before = crud.get_projects(db=db_session)
    create_test_project(db_session, name="Project List Test 1")
    create_test_project(db_session, name="Project List Test 2")
    projects_after = crud.get_projects(db=db_session)
    assert len(projects_after) == len(projects_before) + 2

def test_update_project(db_session: Session):
    project = create_test_project(db_session, name="Original Project Name")
    update_data = schemas.ProjectUpdate(name="Updated Project Name", description="Updated Desc")
    updated_project = crud.update_project(db=db_session, project_id=project.id, project_update=update_data)
    assert updated_project is not None
    assert updated_project.name == "Updated Project Name"
    assert updated_project.description == "Updated Desc"

    # Test updating non-existent project
    non_existent_update = crud.update_project(db=db_session, project_id=999, project_update=update_data)
    assert non_existent_update is None

def test_delete_project(db_session: Session):
    project = create_test_project(db_session, name="To Be Deleted")
    project_id = project.id
    deleted_project = crud.delete_project(db=db_session, project_id=project_id)
    assert deleted_project is not None
    assert deleted_project.id == project_id
    assert crud.get_project(db=db_session, project_id=project_id) is None

    # Test deleting non-existent project
    non_existent_delete = crud.delete_project(db=db_session, project_id=999)
    assert non_existent_delete is None

def test_delete_project_with_tasks_and_mock_print(db_session: Session): # Renamed and removed capsys
    # Create a project
    project = create_test_project(db_session, name="Project With Tasks For Print Mock Test")
    project_id = project.id

    # Create tasks associated with this project
    crud.create_task(db_session, schemas.TaskCreate(title="Task 1 for Print Mock Test", project_id=project_id))
    crud.create_task(db_session, schemas.TaskCreate(title="Task 2 for Print Mock Test", project_id=project_id))

    expected_print_arg = f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project_id}"

    with mock.patch('builtins.print') as mock_print:
        deleted_project = crud.delete_project(db=db_session, project_id=project_id)
    
    assert deleted_project is not None
    assert crud.get_project(db=db_session, project_id=project_id) is None

    # Check that tasks are deleted (cascade)
    tasks_after_delete = crud.get_tasks(db_session, project_id=project_id)
    assert len(tasks_after_delete) == 0

    mock_print.assert_called_once_with(expected_print_arg)

def test_delete_project_prints_task_count(db_session):
    # Create a project with some tasks
    project = crud.create_project(db_session, schemas.ProjectCreate(name="Project with Tasks"))
    task1 = crud.create_task(db_session, schemas.TaskCreate(title="Task 1", project_id=project.id))
    task2 = crud.create_task(db_session, schemas.TaskCreate(title="Task 2", project_id=project.id))

    import sys
    from io import StringIO
    stdout = StringIO()
    sys.stdout = stdout

    try:
        crud.delete_project(db_session, project_id=project.id)
        output = stdout.getvalue()
        assert f"[CRUD delete_project] Deleted 2 tasks associated with project_id: {project.id}" in output
    finally:
        sys.stdout = sys.__stdout__

# --- Agent CRUD Tests ---
def test_create_and_get_agent(db_session: Session):
    agent_schema = schemas.AgentCreate(name="Test Agent Alpha")
    db_agent = crud.create_agent(db=db_session, agent=agent_schema)
    assert db_agent is not None
    assert db_agent.name == "Test Agent Alpha"
    assert db_agent.id is not None

    retrieved_agent = crud.get_agent(db=db_session, agent_id=db_agent.id)
    assert retrieved_agent is not None
    assert retrieved_agent.id == db_agent.id

    retrieved_by_name = crud.get_agent_by_name(db=db_session, name="Test Agent Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_agent.id

def test_get_agent_not_found(db_session: Session):
    # Test non-existent agent by ID
    assert crud.get_agent(db=db_session, agent_id=8888) is None
    # Test non-existent agent by name
    assert crud.get_agent_by_name(db=db_session, name="NonExistentAgent") is None
    # Test with None values
    assert crud.get_agent(db=db_session, agent_id=None) is None
    assert crud.get_agent_by_name(db=db_session, name=None) is None

def test_get_agents(db_session: Session):
    agents_before = crud.get_agents(db=db_session)
    create_test_agent(db_session, name="Agent List Test 1")
    create_test_agent(db_session, name="Agent List Test 2")
    agents_after = crud.get_agents(db=db_session)
    assert len(agents_after) == len(agents_before) + 2

def test_update_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Original Agent Name")
    update_data = schemas.AgentUpdate(name="Updated Agent Name")
    updated_agent = crud.update_agent(db=db_session, agent_id=agent.id, agent_update=update_data)
    assert updated_agent is not None
    assert updated_agent.name == "Updated Agent Name"

def test_delete_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Agent To Delete")
    agent_id = agent.id
    deleted_agent = crud.delete_agent(db=db_session, agent_id=agent_id)
    assert deleted_agent is not None
    assert deleted_agent.id == agent_id
    assert crud.get_agent(db=db_session, agent_id=agent_id) is None


# --- Task CRUD Tests ---
def test_create_and_get_task(db_session: Session):
    project = create_test_project(db_session)
    agent = create_test_agent(db_session)

    task_schema = schemas.TaskCreate(
        title="Test Task Alpha", 
        description="Task Alpha Description",
        project_id=project.id,
        agent_name=agent.name
    )
    db_task = crud.create_task(db=db_session, task=task_schema)
    assert db_task is not None
    assert db_task.title == "Test Task Alpha"
    assert db_task.project_id == project.id
    assert db_task.agent is not None # Check agent relationship is loaded
    assert db_task.agent.id == agent.id # Check correct agent is linked
    # assert db_task.agent_name == agent.name # Can also check by name
    assert db_task.id is not None

    retrieved_task = crud.get_task(db=db_session, task_id=db_task.id)
    assert retrieved_task is not None
    assert retrieved_task.id == db_task.id

def test_get_task_not_found(db_session: Session):
    assert crud.get_task(db=db_session, task_id=7777) is None

def test_get_tasks_with_filtering(db_session: Session):
    project1 = create_test_project(db_session, name="Filter Project 1")
    project2 = create_test_project(db_session, name="Filter Project 2")
    agent1 = create_test_agent(db_session, name="Filter Agent 1")
    agent2 = create_test_agent(db_session, name="Filter Agent 2")

    crud.create_task(db_session, schemas.TaskCreate(title="P1A1 Task", project_id=project1.id, agent_name=agent1.name))
    crud.create_task(db_session, schemas.TaskCreate(title="P1A2 Task", project_id=project1.id, agent_name=agent2.name))
    crud.create_task(db_session, schemas.TaskCreate(title="P2A1 Task", project_id=project2.id, agent_name=agent1.name))

    # Test filtering by project_id
    p1_tasks = crud.get_tasks(db_session, project_id=project1.id)
    assert len(p1_tasks) == 2
    for task in p1_tasks: assert task.project_id == project1.id

    # Test filtering by agent_name (which translates to agent_id in crud.get_tasks)
    a1_tasks = crud.get_tasks(db_session, agent_id=agent1.id)
    assert len(a1_tasks) == 2
    for task in a1_tasks:
        assert task.agent_id == agent1.id

    # Test filtering by both
    p1a2_tasks = crud.get_tasks(db_session, project_id=project1.id, agent_id=agent2.id)
    assert len(p1a2_tasks) == 1
    assert p1a2_tasks[0].project_id == project1.id
    assert p1a2_tasks[0].agent_id == agent2.id

    # Test get all (or with limit)
    all_tasks = crud.get_tasks(db_session, limit=10)
    assert len(all_tasks) >= 3 # Could be more if other tests created tasks

def test_update_task(db_session: Session):
    project = create_test_project(db_session)
    agent = create_test_agent(db_session)
    task = crud.create_task(db_session, schemas.TaskCreate(title="Original Task Title", project_id=project.id, agent_name=agent.name))
    
    update_data = schemas.TaskUpdate(
        title="Updated Task Title", 
        description="Updated Desc", 
        completed=True,
        project_id=project.id, # Can also test changing project/agent later
        agent_name=agent.name
    )
    updated_task = crud.update_task(db=db_session, task_id=task.id, task_update=update_data)
    assert updated_task is not None
    assert updated_task.title == "Updated Task Title"
    assert updated_task.description == "Updated Desc"
    assert updated_task.completed is True

def test_update_task_with_invalid_relations(db_session: Session):
    project = create_test_project(db_session)
    task = crud.create_task(db_session, schemas.TaskCreate(title="Task for Invalid Relations Test", project_id=project.id))
    
    non_existent_project_id = str(uuid.uuid4().hex)
    non_existent_agent_id = str(uuid.uuid4().hex)

    # Test updating with non-existent project_id
    with pytest.raises(ValueError, match=f"Project with id {non_existent_project_id} not found"):
        crud.update_task(db_session, task_id=task.id, task_update=schemas.TaskUpdate(project_id=non_existent_project_id))

    # Test updating with non-existent agent_id (agent_id is not None)
    with pytest.raises(ValueError, match=f"Agent with id {non_existent_agent_id} not found"):
        crud.update_task(db_session, task_id=task.id, task_update=schemas.TaskUpdate(agent_id=non_existent_agent_id))

    # Test updating with agent_id = None (should not raise error, should be allowed to clear agent)
    task_after_agent_cleared = crud.update_task(db_session, task_id=task.id, task_update=schemas.TaskUpdate(agent_id=None))
    assert task_after_agent_cleared.agent_id is None

def test_delete_task(db_session: Session):
    # Create a task to delete
    project = crud.create_project(db=db_session, project=schemas.ProjectCreate(name="Test Project"))
    task = crud.create_task(
        db=db_session,
        task=schemas.TaskCreate(
            title="Test Task",
            description="Task to be deleted",
            project_id=project.id
        )
    )
    
    # Create a subtask for the task
    subtask = crud.create_subtask(
        db=db_session,
        subtask=schemas.SubtaskClientCreate(
            title="Test Subtask",
            description="Subtask to be deleted with parent",
            completed=False
        ),
        parent_task_id=task.id
    )
    
    # Verify task and subtask exist
    assert crud.get_task(db=db_session, task_id=task.id) is not None
    assert crud.get_subtask(db=db_session, subtask_id=subtask.id) is not None
    
    # Delete the task
    crud.delete_task(db=db_session, task_id=task.id)
    
    # Verify task and its subtask are deleted
    assert crud.get_task(db=db_session, task_id=task.id) is None
    assert crud.get_subtask(db=db_session, subtask_id=subtask.id) is None
    
    # Test deleting non-existent task (should not raise error)
    crud.delete_task(db=db_session, task_id="non_existent_id")
    
    # Test deleting with None task_id (should not raise error)
    crud.delete_task(db=db_session, task_id=None)


# --- Task Sub-task CRUD Tests ---
def test_create_task_with_parent(db_session: Session):
    # Create a project and agent for the tasks
    project = create_test_project(db_session, name="ProjectForParentTaskTest")
    # agent = create_test_agent(db_session, name="AgentForParentTaskTest") # Agent is optional for task creation schema now

    parent_task_schema = schemas.TaskCreate(
        title="Parent Task for Sub-task Test",
        project_id=project.id # Provide project_id
        # agent_name=agent.name # Optional
    )
    parent_task = crud.create_task(db_session, parent_task_schema)
    assert parent_task is not None
    assert parent_task.title == "Parent Task for Sub-task Test"

    # Instead, let's focus on creating subtasks for the parent task here as per recent changes.
    # This test might need rethinking or renaming if its original intent was different.
    # For now, let's assume it wants to test creation of subtasks linked to this parent.
    subtask_schema = schemas.SubtaskClientCreate(title="Subtask of Parent Task Test")
    created_subtask = crud.create_subtask(db_session, subtask_schema, parent_task_id=parent_task.id)
    assert created_subtask is not None
    assert created_subtask.title == "Subtask of Parent Task Test"
    assert created_subtask.task_id == parent_task.id

    # Verify the parent task now has this subtask in its 'subtasks' relationship
    db_session.refresh(parent_task, attribute_names=['subtasks'])
    assert len(parent_task.subtasks) == 1
    assert parent_task.subtasks[0].id == created_subtask.id


def test_create_task_with_invalid_parent(db_session: Session):
    # Create a project and agent for the task
    project = create_test_project(db_session, name="ProjectForInvalidParentTest")
    # agent = create_test_agent(db_session, name="AgentForInvalidParentTest") # Optional

    # Test creating a subtask with a non-existent parent_task_id
    with pytest.raises(ValueError, match=r"Parent task with id non_existent_parent_uuid not found"):
        crud.create_subtask(
            db_session, 
            schemas.SubtaskClientCreate(title="Subtask Invalid Parent"), 
            parent_task_id="non_existent_parent_uuid"
        )


def test_get_tasks_with_parent_id_filter(db_session: Session):
    # Create a project for tasks
    project = create_test_project(db_session, name="ProjectForParentFilterTest")

    parent1 = crud.create_task(db_session, schemas.TaskCreate(title="Parent for Filter 1", project_id=project.id))
    parent2 = crud.create_task(db_session, schemas.TaskCreate(title="Parent for Filter 2", project_id=project.id))

    # Create subtasks for parent1
    crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask P1-1"), parent_task_id=parent1.id)
    crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask P1-2"), parent_task_id=parent1.id)
    # Create subtask for parent2
    crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask P2-1"), parent_task_id=parent2.id)

    # Now use list_subtasks_crud as get_tasks no longer filters by parent_id
    parent1_subtasks = crud.list_subtasks_crud(db_session, parent_task_id=parent1.id)
    assert len(parent1_subtasks) == 2
    for subtask in parent1_subtasks:
        assert subtask.task_id == parent1.id

    parent2_subtasks = crud.list_subtasks_crud(db_session, parent_task_id=parent2.id)
    assert len(parent2_subtasks) == 1
    assert parent2_subtasks[0].task_id == parent2.id

    no_parent_subtasks = crud.list_subtasks_crud(db_session, parent_task_id="non-existent-parent-uuid")
    assert len(no_parent_subtasks) == 0


def test_update_task_parent_id(db_session: Session):
    # This test needs to be re-evaluated as Task.parent_task_id is deprecated in favor of Subtask model.
    # Updating a subtask's parent (task_id) is not directly done via TaskUpdate schema.
    # It would typically involve deleting and recreating the subtask or a specific subtask update endpoint.
    # For now, we will test updating other fields of a subtask.
    project = create_test_project(db_session, name="ProjectForSubtaskUpdateTest")
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent for Subtask Update", project_id=project.id))
    subtask_to_update = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Original Subtask Title"), parent_task_id=parent_task.id)
    
    update_payload = schemas.SubtaskUpdate(title="Updated Subtask Title by test_update_task_parent_id", completed=True)
    updated_subtask = crud.update_subtask(db_session, subtask_id=subtask_to_update.id, subtask_update=update_payload)

    assert updated_subtask is not None
    assert updated_subtask.title == "Updated Subtask Title by test_update_task_parent_id"
    assert updated_subtask.completed is True
    assert updated_subtask.task_id == parent_task.id # Parent should remain the same


def test_delete_parent_task_cascades(db_session: Session):
    project = create_test_project(db_session, name="ProjectForCascadeDeleteTest")
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent with Children to Delete", project_id=project.id))
    subtask1 = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Child Subtask 1"), parent_task_id=parent_task.id)
    subtask2 = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Child Subtask 2"), parent_task_id=parent_task.id)

    # Ensure subtasks are created
    assert crud.get_subtask(db_session, subtask_id=subtask1.id) is not None
    assert crud.get_subtask(db_session, subtask_id=subtask2.id) is not None

    # Delete the parent task
    crud.delete_task(db_session, task_id=parent_task.id)

    # Verify parent task is deleted
    assert crud.get_task(db_session, task_id=parent_task.id) is None
    # Verify subtasks are also deleted due to cascade (from models.Task.subtasks relationship)
    assert crud.get_subtask(db_session, subtask_id=subtask1.id) is None, "Subtask1 should be cascade deleted"
    assert crud.get_subtask(db_session, subtask_id=subtask2.id) is None, "Subtask2 should be cascade deleted"


def test_prevent_circular_dependency_direct(db_session: Session):
    """Test that the model structure prevents circular dependencies between tasks and subtasks."""
    # Create a project and task
    project = create_test_project(db_session, name="Project for Circular Test")
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent Task", project_id=project.id))

    # Create a subtask
    subtask = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask"), parent_task.id)

    # Verify the relationships
    assert subtask.task_id == parent_task.id

    # Verify that a subtask cannot be a parent task (structurally prevented)
    # This is enforced by the model design where:
    # 1. Subtasks are a separate table with a foreign key to tasks
    # 2. Tasks cannot have a foreign key to subtasks
    # 3. The schema validation prevents creating a task with a subtask_id

    # Attempt to create a task with a subtask as parent (should fail)
    with pytest.raises(ValueError, match="Invalid parent_task_id: Cannot use a subtask as a parent task"):
        crud.create_task(db_session, schemas.TaskCreate(title="Invalid Task", project_id=project.id, parent_task_id=subtask.id))

    # Attempt to update a task to have a subtask as parent (should fail)
    another_task = crud.create_task(db_session, schemas.TaskCreate(title="Another Task", project_id=project.id))
    with pytest.raises(ValueError, match="Invalid parent_task_id: Cannot use a subtask as a parent task"):
        crud.update_task(db_session, task_id=another_task.id, task_update=schemas.TaskUpdate(parent_task_id=subtask.id))

def test_update_subtask_crud_edge_cases(db_session: Session):
    """Test edge cases in update_subtask function."""
    # Create a project and task
    project = create_test_project(db_session, name="Project for Subtask Update Edge Cases")
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent Task", project_id=project.id))

    # Create a subtask
    subtask = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask"), parent_task.id)

    # Test updating with no changes
    updated_subtask = crud.update_subtask(db_session, subtask_id=subtask.id, subtask_update=schemas.SubtaskUpdate())
    assert updated_subtask is not None
    assert updated_subtask.id == subtask.id
    assert updated_subtask.title == subtask.title
    
    # Test updating with non-existent subtask
    non_existent_id = "non-existent-id"
    assert crud.update_subtask(db_session, subtask_id=non_existent_id, subtask_update=schemas.SubtaskUpdate()) is None

def test_create_task_with_subtask_as_parent(db_session: Session):
    """Test that creating a task with a subtask as parent_task_id fails"""
    # Create a project and task
    project = create_test_project(db_session, name="Project for Subtask Parent Test")
    task = crud.create_task(db_session, schemas.TaskCreate(title="Parent Task", project_id=project.id))

    # Create a subtask
    subtask = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask"), task.id)

    # Try to create a task with the subtask as parent_task_id
    with pytest.raises(ValueError, match="Invalid parent_task_id: Cannot use a subtask as a parent task"):
        crud.create_task(db_session, schemas.TaskCreate(
            title="Task with Subtask Parent",
            project_id=project.id,  # Add the required project_id
            parent_task_id=subtask.id
        ))

def test_update_task_with_subtask_as_parent(db_session: Session):
    """Test that updating a task with a subtask as parent_task_id fails"""
    # Create a project and task
    project = create_test_project(db_session, name="Project for Subtask Parent Update Test")
    task = crud.create_task(db_session, schemas.TaskCreate(title="Task to Update", project_id=project.id))
    
    # Create another task and its subtask
    other_task = crud.create_task(db_session, schemas.TaskCreate(title="Other Task", project_id=project.id))
    subtask = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask"), other_task.id)
    
    # Try to update the task with the subtask as parent_task_id
    with pytest.raises(ValueError, match="Invalid parent_task_id: Cannot use a subtask as a parent task"):
        crud.update_task(db_session, task_id=task.id, task_update=schemas.TaskUpdate(parent_task_id=subtask.id))


# --- Subtask CRUD Tests ---
# (Moved some logic from above task tests here, focusing on subtasks)

def test_update_subtask_crud(db_session: Session): # RENAMED and REFINED
    project = create_test_project(db_session, name="ProjectForSubtaskUpdateTest")
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent for Subtask Update", project_id=project.id))
    
    # Create subtask and immediately get its initial updated_at from DB via a fresh get
    subtask_created = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Original Subtask Title"), parent_task_id=parent_task.id)
    db_session.commit() # Commit to ensure created_at/updated_at defaults are set in DB if not already by create
    
    subtask_from_db_before_update = crud.get_subtask(db_session, subtask_id=subtask_created.id)
    assert subtask_from_db_before_update is not None
    original_updated_at = subtask_from_db_before_update.updated_at
    assert original_updated_at is not None # Should be set by default lambda on creation

    # Simulate some time passing, or ensure the update payload is different enough
    # Forcing a slight delay to ensure timestamp changes if system clock resolution is low
    time.sleep(0.01)
    
    update_payload = schemas.SubtaskUpdate(title="Updated Subtask Title by test_update_subtask_crud", completed=True)
    updated_subtask = crud.update_subtask(db_session, subtask_id=subtask_created.id, subtask_update=update_payload)

    assert updated_subtask is not None
    assert updated_subtask.title == "Updated Subtask Title by test_update_subtask_crud"
    assert updated_subtask.completed is True
    assert updated_subtask.task_id == parent_task.id
    assert updated_subtask.updated_at is not None
    assert updated_subtask.updated_at > original_updated_at # Crucial check for updated_at


def test_delete_parent_task_cascades(db_session: Session):
    project = create_test_project(db_session, name="ProjectForCascadeDeleteTest")
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent with Children to Delete", project_id=project.id))
    subtask1 = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Child Subtask 1"), parent_task_id=parent_task.id)
    subtask2 = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Child Subtask 2"), parent_task_id=parent_task.id)

    # Ensure subtasks are created
    assert crud.get_subtask(db_session, subtask_id=subtask1.id) is not None
    assert crud.get_subtask(db_session, subtask_id=subtask2.id) is not None

    # Delete the parent task
    crud.delete_task(db_session, task_id=parent_task.id)

    # Verify parent task is deleted
    assert crud.get_task(db_session, task_id=parent_task.id) is None
    # Verify subtasks are also deleted due to cascade (from models.Task.subtasks relationship)
    assert crud.get_subtask(db_session, subtask_id=subtask1.id) is None, "Subtask1 should be cascade deleted"
    assert crud.get_subtask(db_session, subtask_id=subtask2.id) is None, "Subtask2 should be cascade deleted"


def test_get_db_with_exception():
    from backend.database import get_db
    from unittest.mock import MagicMock
    
    # Create a mock session
    mock_session = MagicMock()
    
    # Create a mock SessionLocal that returns our mock session
    mock_session_local = MagicMock(return_value=mock_session)
    
    # Patch SessionLocal to return our mock
    with mock.patch('backend.database.SessionLocal', mock_session_local):
        db_generator = get_db()
        session = next(db_generator)
        
        try:
            with pytest.raises(Exception):
                # Force an exception after getting the session
                raise Exception("Test exception")
        finally:
            try:
                db_generator.close()  # This should trigger the finally block in get_db
            except:
                pass  # We don't care about errors in the generator cleanup
        
        # Verify that close was called on the session
        mock_session.close.assert_called_once()


def test_update_subtask_refreshes_timestamp(db_session):
    # Create a project and parent task
    project = crud.create_project(db_session, schemas.ProjectCreate(name="Project for Subtask Refresh"))
    parent_task = crud.create_task(db_session, schemas.TaskCreate(title="Parent Task", project_id=project.id))
    
    # Create a subtask
    subtask = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Original Title"), parent_task.id)
    original_updated_at = subtask.updated_at
    
    # Wait a moment to ensure timestamp would be different
    time.sleep(0.01)
    
    # Update the subtask
    updated_subtask = crud.update_subtask(db_session, subtask.id, schemas.SubtaskUpdate(title="Updated Title"))
    assert updated_subtask.updated_at > original_updated_at


def test_get_tasks_print_statements(db_session: Session):
    # Create test data
    project = create_test_project(db_session, name="Project for Get Tasks Print")
    agent = create_test_agent(db_session, name="Agent for Get Tasks Print")
    
    # Create a task with both project and agent
    task = crud.create_task(
        db_session, 
        schemas.TaskCreate(
            title="Task for Print Test",
            project_id=project.id,
            agent_name=agent.name
        )
    )

    # Capture print statements
    import sys
    from io import StringIO
    stdout = StringIO()
    sys.stdout = stdout

    try:
        # Test with no filters
        crud.get_tasks(db_session)
        
        # Test with project_id filter
        crud.get_tasks(db_session, project_id=project.id)
        
        # Test with agent_id filter
        crud.get_tasks(db_session, agent_id=agent.id)
        
        # Test with both filters
        crud.get_tasks(db_session, project_id=project.id, agent_id=agent.id)
        
        output = stdout.getvalue()
        
        # Verify print statements for base case
        assert "[CRUD get_tasks] Received project_id: None, agent_id: None" in output
        assert "[CRUD get_tasks] Base query:" in output
        assert "[CRUD get_tasks] Number of results returned:" in output
        
        # Verify print statements for project_id filter
        assert f"[CRUD get_tasks] Received project_id: {project.id}" in output
        assert "[CRUD get_tasks] Applying project_id filter:" in output
        assert "[CRUD get_tasks] Query after project_id filter:" in output
        
        # Verify print statements for agent_id filter
        assert f"[CRUD get_tasks] Received project_id: None, agent_id: {agent.id}" in output
        assert "[CRUD get_tasks] Applying agent_id filter:" in output
        assert "[CRUD get_tasks] Query after agent_id filter:" in output
        
    finally:
        sys.stdout = sys.__stdout__


def test_create_agent_refreshes_data(db_session: Session):
    # Create an agent
    agent_schema = schemas.AgentCreate(name="Agent for Refresh Test")
    db_agent = crud.create_agent(db=db_session, agent=agent_schema)
    
    # Verify the agent was created and refreshed properly
    assert db_agent is not None
    assert db_agent.id is not None
    assert db_agent.name == "Agent for Refresh Test"
    assert db_agent.created_at is not None  # This field should be populated after refresh
    
    # Verify we can retrieve the agent with all its data
    retrieved_agent = crud.get_agent(db_session, agent_id=db_agent.id)
    assert retrieved_agent is not None
    assert retrieved_agent.id == db_agent.id
    assert retrieved_agent.name == db_agent.name
    assert retrieved_agent.created_at == db_agent.created_at

def test_update_task_parent_task_validation(db_session: Session):
    # Create a project and task
    project = create_test_project(db_session, name="Project for Parent Task Validation")
    task = crud.create_task(db_session, schemas.TaskCreate(title="Task to Update", project_id=project.id))
    
    # Create a subtask
    subtask = crud.create_subtask(db_session, schemas.SubtaskClientCreate(title="Subtask"), task.id)
    
    # Test updating with non-existent parent_task_id
    non_existent_id = str(uuid.uuid4())
    with pytest.raises(ValueError, match=f"Parent task with id {non_existent_id} not found"):
        crud.update_task(db_session, task_id=task.id, task_update=schemas.TaskUpdate(parent_task_id=non_existent_id))
    
    # Test updating with a subtask as parent_task_id (should fail)
    with pytest.raises(ValueError, match="Invalid parent_task_id: Cannot use a subtask as a parent task"):
        crud.update_task(db_session, task_id=task.id, task_update=schemas.TaskUpdate(parent_task_id=subtask.id))

def test_create_task_parent_task_not_found(db_session: Session):
    """Test that creating a task with a non-existent parent_task_id fails"""
    # Create a project
    project = create_test_project(db_session, name="Project for Parent Task Not Found")
    
    # Try to create a task with a non-existent parent_task_id
    non_existent_id = str(uuid.uuid4())
    with pytest.raises(ValueError, match=f"Parent task with id {non_existent_id} not found"):
        crud.create_task(db_session, schemas.TaskCreate(
            title="Task with Non-existent Parent",
            project_id=project.id,
            parent_task_id=non_existent_id
        ))

