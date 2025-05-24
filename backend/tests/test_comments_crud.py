# Project: project-manager

import pytest
from sqlalchemy.orm import Session
import uuid

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects # Needed for comment tests
from backend.crud import tasks as crud_tasks # Needed for comment tests
from backend.crud import agents as crud_agents # Needed for comment tests
from backend.crud import comments as crud_comments

# Helper function to create a project for testing other entities
def create_test_project(db: Session, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    return crud_projects.create_project(db=db, project=project_schema)

# Helper function to create a task for testing comments
def create_test_task(db: Session, project_id: uuid.UUID, title="Test Task") -> models.Task:
    task_create_schema = schemas.TaskCreate(title=title, project_id=str(project_id))
    return crud_tasks.create_task(db, project_id, task=task_create_schema)

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud_agents.create_agent(db=db, agent=agent_schema)

# --- Comment CRUD Tests ---

def test_create_and_get_comment(db_session: Session):
    project = create_test_project(db_session, name="Comment Project")
    task = create_test_task(db_session, project.id, title="Task for Comment")
    agent = create_test_agent(db_session, name="Commenting Agent")

    comment_data = schemas.CommentCreate(
        task_project_id=task.project_id,
        task_task_number=task.task_number,
        author_id=agent.id,
        content="This is a test comment."
    )
    db_comment = crud_comments.create_comment(db_session, comment_data)
    assert db_comment is not None
    assert str(db_comment.task_project_id) == str(task.project_id)
    assert db_comment.task_task_number == task.task_number
    assert db_comment.author_id == agent.id
    assert db_comment.content == "This is a test comment."
    assert db_comment.id is not None

    retrieved_comment = crud_comments.get_comment(db_session, comment_id=db_comment.id)
    assert retrieved_comment is not None
    assert retrieved_comment.id == db_comment.id
    assert retrieved_comment.content == "This is a test comment."


def test_get_comment_not_found(db_session: Session):
    assert crud_comments.get_comment(db_session, comment_id=99999) is None


def test_get_comments_by_task(db_session: Session):
    project = create_test_project(db_session, name="Comments By Task Project")
    task1 = create_test_task(db_session, project.id, title="Task with Comments")
    task2 = create_test_task(db_session, project.id, title="Task without Comments")
    agent = create_test_agent(db_session, name="Task Commenter")

    # Add comments to task 1
    comment_data_1 = schemas.CommentCreate(task_project_id=task1.project_id, task_task_number=task1.task_number, author_id=agent.id, content="Comment 1 for task 1")
    comment_data_2 = schemas.CommentCreate(task_project_id=task1.project_id, task_task_number=task1.task_number, author_id=agent.id, content="Comment 2 for task 1")
    crud_comments.create_comment(db_session, comment_data_1)
    crud_comments.create_comment(db_session, comment_data_2)

    # Get comments for task 1
    task1_comments = crud_comments.get_comments_by_task(db_session, task_project_id=task1.project_id, task_number=task1.task_number)
    assert len(task1_comments) == 2
    assert all(c.task_project_id == task1.project_id and c.task_task_number == task1.task_number for c in task1_comments)

    # Get comments for task 2 (should be empty)
    task2_comments = crud_comments.get_comments_by_task(db_session, task_project_id=task2.project_id, task_number=task2.task_number)
    assert len(task2_comments) == 0

    # Get comments for a non-existent task
    non_existent_comments = crud_comments.get_comments_by_task(db_session, task_project_id=str(uuid.uuid4()), task_number=9999)
    assert len(non_existent_comments) == 0


def test_update_comment(db_session: Session):
    project = create_test_project(db_session, name="Update Comment Project")
    task = create_test_task(db_session, project.id, title="Task to Update Comment")
    agent = create_test_agent(db_session, name="Updater Agent")

    comment_data = schemas.CommentCreate(task_project_id=task.project_id, task_task_number=task.task_number, author_id=agent.id, content="Original content.")
    db_comment = crud_comments.create_comment(db_session, comment_data)
    comment_id = db_comment.id

    update_data = schemas.CommentUpdate(content="Updated content.")
    updated_comment = crud_comments.update_comment(db_session, comment_id=comment_id, comment_update=update_data)
    assert updated_comment is not None
    assert updated_comment.id == comment_id
    assert updated_comment.content == "Updated content."

    # Verify persistence
    retrieved_comment = crud_comments.get_comment(db_session, comment_id=comment_id)
    assert retrieved_comment.content == "Updated content."

    # Try updating a non-existent comment
    updated_non_existent = crud_comments.update_comment(db_session, comment_id=99999, comment_update=update_data)
    assert updated_non_existent is None


def test_delete_comment(db_session: Session):
    project = create_test_project(db_session, name="Delete Comment Project")
    task = create_test_task(db_session, project.id, title="Task to Delete Comment")
    agent = create_test_agent(db_session, name="Deleter Agent")

    comment_data = schemas.CommentCreate(task_project_id=task.project_id, task_task_number=task.task_number, author_id=agent.id, content="Comment to be deleted.")
    db_comment = crud_comments.create_comment(db_session, comment_data)
    comment_id = db_comment.id

    deleted = crud_comments.delete_comment(db_session, comment_id=comment_id)
    assert deleted is True
    assert crud_comments.get_comment(db_session, comment_id=comment_id) is None

    # Try deleting a non-existent comment
    deleted_not_found = crud_comments.delete_comment(db_session, comment_id=99999)
    assert deleted_not_found is False

# --- Comment CRUD Tests End --- 