# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

# Import the new TaskStatusEnum
from ..enums import TaskStatusEnum

# Import explicitly for forward references
from .project import Project
from .task_status import TaskStatus

# Use TYPE_CHECKING to avoid circular imports
if TYPE_CHECKING:
 from .agent import Agent
 from .task_dependency import TaskDependency
 from .comment import Comment
 from .file_association import TaskFileAssociation

# --- Task Schemas (Updated) ---

# Base model for common attributes
class TaskBase(BaseModel):
 """Base schema for task attributes."""
 title: str
 description: Optional[str] = None
 # Use the TaskStatusEnum for the status field
 status: TaskStatusEnum = Field(TaskStatusEnum.TO_DO, description="The current status of the task.")
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
 # Use the TaskStatusEnum for the status field in updates as well
 status: Optional[TaskStatusEnum] = Field(None, description="New status for the task.")
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
 project: Optional["Project"] = Field(
 None, description="The project this task belongs to (populated from ORM).")
 agent: Optional["Agent"] = Field(
 None, description="The agent assigned to this task (populated from ORM).")
 status_object: Optional["TaskStatus"] = Field(
 None, description="The status object associated with this task (populated from ORM).")
 dependencies_as_predecessor: List["TaskDependency"] = Field(
 default=[], description="Tasks that depend on this task (populated from ORM).")
 dependencies_as_successor: List["TaskDependency"] = Field(
 default=[], description="Tasks this task depends on (populated from ORM).")
 task_files: List["TaskFileAssociation"] = Field(
 default=[], description="Files associated with this task (populated from ORM).")
 comments: List["Comment"] = Field(
 default=[], description="Comments on this task (populated from ORM).")

 model_config = ConfigDict(from_attributes=True)

class TaskInDB(TaskInDBBase):
 pass