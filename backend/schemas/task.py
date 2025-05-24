# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

# Direct imports for related schemas
from backend.schemas.project import Project
from backend.schemas.agent import Agent
from backend.schemas.task_status import TaskStatus
from backend.schemas.task_dependency import TaskDependency
from backend.schemas.comment import Comment
from backend.schemas.file_association import TaskFileAssociation

# Forward references for relationships (will be resolved by Pydantic)
# Project = "backend.schemas.project.Project"  # Adjusted to reflect new location
# Agent = "backend.schemas.agent.Agent"  # Adjusted to reflect new location
# TaskStatus = "backend.schemas.task_status.TaskStatus"
# TaskDependency = "backend.schemas.task_dependency.TaskDependency"
# Comment = "backend.schemas.comment.Comment"
# TaskFileAssociation = "backend.schemas.file_association.TaskFileAssociation"

# --- Task Schemas (Updated) ---

# Base model for common attributes
class TaskBase(BaseModel):
    """Base schema for task attributes."""
    title: str
    description: Optional[str] = None
    status: Optional[str] = "To Do"
    is_archived: Optional[bool] = False


# Model for creating a task (inherits from Base, specific for creation)
class TaskCreate(TaskBase):
    """Schema used for creating a new task.
    Allows specifying agent by name for convenience during creation.
    """
    agent_name: Optional[str] = Field(
        None, description="Name of the agent to assign (alternative to agent_id).")


# Model for updating a task (all fields optional)
class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""
    title: Optional[str] = Field(None, description="New title for the task.")
    description: Optional[str] = Field(
        None, description="New description for the task.")
    agent_id: Optional[str] = Field(
        None, description="New agent ID for the task.")
    status: Optional[str] = Field(None, description="New status for the task.")
    is_archived: Optional[bool] = Field(
        None, description="Set the archived status of the task.")


# --- Full Schemas (Output/Read) ---
class TaskInDBBase(TaskBase):
    project_id: str
    task_number: int
    agent_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Task(TaskInDBBase):
    """Schema for representing a task in API responses, including relationships."""
    project: Optional[Project] = Field(
        None, description="The project this task belongs to (populated from ORM).")
    agent: Optional[Agent] = Field(
        None, description="The agent assigned to this task (populated from ORM).")
    status_object: Optional[TaskStatus] = Field(
        None, description="The status object associated with this task (populated from ORM).")
    dependencies_as_predecessor: List[TaskDependency] = Field(
        [], description="Tasks that depend on this task (populated from ORM).")
    dependencies_as_successor: List[TaskDependency] = Field(
        [], description="Tasks this task depends on (populated from ORM).")
    # task_files: List[TaskFileAssociation] = Field(
    #    [], description="Files associated with this task (populated from ORM).") # Uncomment when model relationship is active
    # comments: List[Comment] = Field(
    #    [], description="Comments on this task (populated from ORM).") # Uncomment when model relationship is active

    model_config = ConfigDict(from_attributes=True)


class TaskInDB(TaskInDBBase):
    pass

# Explicitly trigger forward reference resolution for schemas in this file
Task.model_rebuild()
# TaskStatus.model_rebuild() # If defined here and uses forward refs
# TaskDependency.model_rebuild() # If defined here and uses forward refs
# Comment.model_rebuild() # If defined here and uses forward refs
# TaskFileAssociation.model_rebuild() # If defined here and uses forward refs

# Pydantic will handle forward reference resolution for Project and Agent
# No explicit model_rebuild calls are needed here as they are handled
# globally or when the FastAPI app starts up if models are registered correctly. 