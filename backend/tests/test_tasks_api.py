"""Tests for Tasks API endpoints."""
import pytest
from fastapi import status
from backend.enums import TaskStatusEnum
from backend.models.task import Task


def test_create_task(client, sample_project, sample_agent):
    """Test creating a new task."""
    task_data = {
        "title": "New Test Task",
        "description": "A new task for testing",
        "status": TaskStatusEnum.TO_DO.value,
        "project_id": sample_project.id,
        "agent_id": sample_agent.id
    }
    
    response = client.post("/api/v1/tasks/", json=task_data)
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"] == task_data["title"]


def test_get_tasks_list(client, sample_task):
    """Test getting list of tasks with pagination."""
    response = client.get("/api/v1/tasks/")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "pagination" in data


def test_filter_tasks_by_status(client, db_session, sample_project, sample_agent):
    """Test filtering tasks by status."""
    todo_task = Task(
        title="TODO Task",
        description="Task in TODO status",
        status=TaskStatusEnum.TODO,
        project_id=sample_project.id,
        agent_id=sample_agent.id,
        task_number=100
    )
    
    db_session.add(todo_task)
    db_session.commit()
    
    response = client.get("/api/v1/tasks/?status=todo")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_archive_task(client, sample_task):
    """Test archiving a task."""
    response = client.post(f"/api/v1/tasks/{sample_task.task_number}/archive")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
