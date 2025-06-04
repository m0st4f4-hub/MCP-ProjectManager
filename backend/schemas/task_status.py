# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime  # Forward references
Task = "Task"  # --- Task Status Schemas ---


class TaskStatusBase(BaseModel):
    """Base schema for task status attributes."""
    name: str = Field(..., description="The unique name of the task status (e.g.,"
        "'To Do', 'In Progress').")
    description: Optional[str] = Field(
    None, description="Optional description of the status.")
    is_default: bool = Field(False, description="Whether this is the default status for new tasks.")
    is_completed: bool = Field(False, description="Whether this status indicates task completion.")

class TaskStatusCreate(TaskStatusBase):
    """Schema for creating a new task status."""
    pass

class TaskStatusUpdate(BaseModel):
    """Schema for updating an existing task status. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the status.")
    description: Optional[str] = Field(None, description="New description for the status.")
    is_default: Optional[bool] = Field(None, description="New default status.")
    is_completed: Optional[bool] = Field(None, description="New completed status.")

class TaskStatus(TaskStatusBase):
    """Schema for representing a task status in API responses."""  # Name is the primary key and identifier
    created_at: datetime = Field(..., description="Timestamp when the status was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the status was last updated.")
    tasks_with_status: List[Task] = Field([], description="Tasks with this status (populated from ORM).")

    model_config = ConfigDict(from_attributes=True)  # Note: model_rebuild() is called in main.py after all schemas are loaded
