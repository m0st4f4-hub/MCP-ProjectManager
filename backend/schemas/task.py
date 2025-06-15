from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

from ..enums import TaskStatusEnum

class TaskBase(BaseModel):
    """Base schema for task attributes."""
    title: str = Field(..., max_length=255, description="The title of the task.")
    description: Optional[str] = Field(None, description="Optional description of the task.")
    status: TaskStatusEnum = Field(default=TaskStatusEnum.TO_DO, description="Current status of the task.")
    agent_id: Optional[str] = Field(None, description="ID of the agent responsible for this task.")
    start_date: Optional[datetime] = Field(None, description="When the task should start.")
    due_date: Optional[datetime] = Field(None, description="When the task is due.")


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    project_id: str = Field(..., description="ID of the project this task belongs to.")
    # task_number is auto-generated in the service layer

class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    agent_id: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None


class Task(TaskBase):
    """Schema for representing a task in API responses."""
    project_id: str = Field(..., description="ID of the project this task belongs to.")
    task_number: int = Field(..., description="Task number within the project.")
    created_at: datetime = Field(..., description="When the task was created.")
    updated_at: datetime = Field(..., description="When the task was last updated.")
    is_archived: bool = Field(default=False, description="Whether the task is archived.")
    

    model_config = ConfigDict(from_attributes=True)

