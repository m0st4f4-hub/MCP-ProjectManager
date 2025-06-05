# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime  # Import the new TaskStatusEnum
from ..enums import TaskStatusEnum  # Import explicitly for forward references
from ..validation import ValidationMixin
if TYPE_CHECKING:
    pass  # This can be used for forward references if needed


class TaskBase(BaseModel, ValidationMixin):
    """Base schema for task attributes."""
    title: str
    description: Optional[str] = None  # Use the TaskStatusEnum for the status field
    status: TaskStatusEnum = Field(TaskStatusEnum.TO_DO, description="The current status of the task.")
    is_archived: Optional[bool] = False
    agent_id: Optional[str] = Field(None, description="ID of the agent to assign to this task")
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return cls.validate_safe_string(v, max_length=255)
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v:
            return cls.validate_safe_string(v, max_length=1000)
        return v


class TaskCreate(TaskBase):
    """Schema used for creating a new task.
    Allows specifying agent by name for convenience during creation.
    """
    title: str = Field(alias="name")  # Accept "name" as alias for "title"
    project_id: str = Field(description="ID of the project this task belongs to")
    agent_name: Optional[str] = Field(
        None, description="Name of the agent to assign (alternative to agent_id)."
    )
    assigned_to: Optional[str] = Field(
        None, description="ID of the user this task is assigned to."
    )
    start_date: Optional[datetime] = Field(
        None, description="Start date for the task"
    )
    due_date: Optional[datetime] = Field(
        None, description="Due date for the task"
    )
    
    model_config = ConfigDict(
        populate_by_name=True,  # Allow field aliases
        extra='ignore'  # Ignore extra fields instead of forbidding them
    )  # Model for updating a task (all fields optional)


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""
    title: Optional[str] = Field(None, description="New title for the task.")
    description: Optional[str] = Field(
        None, description="New description for the task."
    )
    agent_id: Optional[str] = Field(
        None, description="New agent ID for the task."
    )  # Use the TaskStatusEnum for the status field in updates as well
    status: Optional[TaskStatusEnum] = Field(None, description="New status for the task.")
    is_archived: Optional[bool] = Field(
        None, description="Set the archived status of the task."
    )
    agent_name: Optional[str] = Field(None, description="New agent name for the task.")
    assigned_to: Optional[str] = Field(None, description="New assignee (user ID) for the task.")
    start_date: Optional[datetime] = Field(None, description="New start date for the task.")
    due_date: Optional[datetime] = Field(None, description="New due date for the task.")


class TaskInDBBase(TaskBase):
    id: str = Field(description="Unique identifier composed of project_id and task_number")
    project_id: str
    task_number: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    project_name: Optional[str] = Field(None, description="Name of the project this task belongs to.")
    agent_name: Optional[str] = Field(None, description="Name of the agent assigned to this task.")
    agent_status: Optional[str] = Field(None, description="Current status of the assigned agent.")
    assigned_to: Optional[str] = Field(None, description="ID of the user this task is assigned to.")
    start_date: Optional[datetime] = Field(None, description="Start date for the task.")
    due_date: Optional[datetime] = Field(None, description="Due date for the task.")

    model_config = ConfigDict(from_attributes=True)

class Task(TaskInDBBase):
    """Schema for representing a task in API responses, including relationships."""
    # Temporarily exclude relationship fields that cause async context issues
    # project: Optional["Project"] = Field(
    #     None, description="The project this task belongs to (populated from ORM)."
    # )
    # agent: Optional["Agent"] = Field(
    #     None, description="The agent assigned to this task (populated from ORM)."
    # )
    # status_object: Optional["TaskStatus"] = Field(
    #     None, description="The status object associated with this task"
    #         "(populated from ORM)."
    # )
    # dependencies_as_predecessor: List["TaskDependency"] = Field(
    #     default=[], description="Tasks that depend on this task (populated from ORM)."
    # )
    # dependencies_as_successor: List["TaskDependency"] = Field(
    #     default=[], description="Tasks this task depends on (populated from ORM)."
    # )
    # task_files: List["TaskFileAssociation"] = Field(
    #     default=[], description="Files associated with this task (populated from ORM)."
    # )
    # comments: List["Comment"] = Field(
    #     default=[], description="Comments on this task (populated from ORM)."
    # )

    model_config = ConfigDict(from_attributes=True)

class TaskInDB(TaskInDBBase):
    model_config = ConfigDict(from_attributes=True)
