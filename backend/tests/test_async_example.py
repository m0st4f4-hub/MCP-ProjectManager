"""
Example of properly structured async tests for the backend.
This serves as a template for converting other test files.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

# Import models
from backend.models import Project, Task, Agent, User

# Import schemas
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.schemas.task import TaskCreate, TaskUpdate

# Import CRUD operations
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks

# Import enums
from backend.enums import TaskStatusEnum


class TestProjectsCRUD:
    """Test suite for project CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_create_project(self, async_db_session: AsyncSession, test_user: User):
        """Test creating a new project."""
        # Create project data
        project_data = ProjectCreate(
            name="Test Project",
            description="This is a test project"
        )
        
        # Create the project
        project = await crud_projects.create_project(
            db=async_db_session,
            project=project_data
        )
        
        # Assertions
        assert project.id is not None
        assert project.name == "Test Project"
        assert project.description == "This is a test project"
        assert project.task_count == 0
        assert project.is_archived is False
    
    @pytest.mark.asyncio
    async def test_get_project(self, async_db_session: AsyncSession, test_project: Project):
        """Test retrieving a project by ID."""
        # Get the project
        retrieved = await crud_projects.get_project(
            db=async_db_session,
            project_id=test_project.id
        )
        
        # Assertions
        assert retrieved is not None
        assert retrieved.id == test_project.id
        assert retrieved.name == test_project.name
    
    @pytest.mark.asyncio
    async def test_get_project_not_found(self, async_db_session: AsyncSession):
        """Test retrieving a non-existent project."""
        # Try to get a project with a fake ID
        project = await crud_projects.get_project(
            db=async_db_session,
            project_id="non-existent-id"
        )
        
        # Should return None
        assert project is None
    
    @pytest.mark.asyncio
    async def test_get_projects(self, async_db_session: AsyncSession, test_user: User):
        """Test retrieving multiple projects."""
        # Create multiple projects
        for i in range(3):
            await crud_projects.create_project(
                db=async_db_session,
                project=ProjectCreate(
                    name=f"Project {i}",
                    description=f"Description {i}"
                )
            )
        
        # Get all projects
        projects = await crud_projects.get_projects(db=async_db_session)
        
        # Assertions
        assert len(projects) >= 3
        assert all(not p.is_archived for p in projects)
    
    @pytest.mark.asyncio
    async def test_update_project(self, async_db_session: AsyncSession, test_project: Project):
        """Test updating a project."""
        # Update data
        update_data = ProjectUpdate(
            name="Updated Project",
            description="Updated description"
        )
        
        # Update the project
        updated = await crud_projects.update_project(
            db=async_db_session,
            project_id=test_project.id,
            project_update=update_data
        )
        
        # Assertions
        assert updated is not None
        assert updated.name == "Updated Project"
        assert updated.description == "Updated description"
        assert updated.id == test_project.id
    
    @pytest.mark.asyncio
    async def test_delete_project(self, async_db_session: AsyncSession, test_user: User):
        """Test deleting a project."""
        # Create a project to delete
        project = await crud_projects.create_project(
            db=async_db_session,
            project=ProjectCreate(
                name="Project to Delete",
                description="This will be deleted"
            )
        )
        
        project_id = project.id
        
        # Delete the project
        deleted = await crud_projects.delete_project(
            db=async_db_session,
            project_id=project_id
        )
        
        # Assertions
        assert deleted is not None
        assert deleted.id == project_id
        
        # Verify it's gone
        retrieved = await crud_projects.get_project(
            db=async_db_session,
            project_id=project_id
        )
        assert retrieved is None


class TestTasksCRUD:
    """Test suite for task CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_create_task(self, async_db_session: AsyncSession, test_project: Project):
        """Test creating a new task."""
        # Create task data
        task_data = TaskCreate(
            title="Test Task",
            description="This is a test task",
            status=TaskStatusEnum.TO_DO
        )
        
        # Create the task
        task = await crud_tasks.create_task(
            db=async_db_session,
            project_id=test_project.id,
            task=task_data
        )
        
        assert isinstance(task, Task)
        assert task.title == "Test Task"
        assert task.description == "This is a test task"
        assert task.status == TaskStatusEnum.TO_DO
        assert task.project_id == test_project.id
        assert task.agent_id is None
    
    @pytest.mark.asyncio
    async def test_get_task(self, async_db_session: AsyncSession, test_task: Task):
        """Test retrieving a task."""
        # Get the task
        retrieved = await crud_tasks.get_task_by_project_and_number(
            db=async_db_session,
            project_id=test_task.project_id,
            task_number=test_task.task_number
        )
        
        assert retrieved is not None
        assert retrieved.project_id == test_task.project_id
        assert retrieved.task_number == test_task.task_number
        assert retrieved.title == test_task.title
        assert retrieved.description == test_task.description
        assert retrieved.status == test_task.status
    
    @pytest.mark.asyncio
    async def test_update_task(self, async_db_session: AsyncSession, test_task: Task, test_agent: Agent):
        """Test updating a task."""
        # Update data
        update_data = TaskUpdate(
            title="Updated Task",
            description="Updated description",
            status=TaskStatusEnum.IN_PROGRESS,
            agent_id=str(test_agent.id)
        )
        
        # Update the task
        updated = await crud_tasks.update_task_by_project_and_number(
            db=async_db_session,
            project_id=test_task.project_id,
            task_number=test_task.task_number,
            task=update_data
        )
        
        assert updated is not None
        assert updated.title == "Updated Task"
        assert updated.description == "Updated description"
        assert updated.status == TaskStatusEnum.IN_PROGRESS
        assert updated.project_id == test_task.project_id
        assert updated.task_number == test_task.task_number
        assert updated.agent_id is not None


# Helper fixtures can be defined here or imported from conftest.py

