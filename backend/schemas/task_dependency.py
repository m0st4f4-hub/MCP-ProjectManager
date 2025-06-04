# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional  # Forward references
Task = "Task"  # --- Task Dependency Schemas ---


class TaskDependencyBase(BaseModel):
    """Base schema for task dependency attributes."""
    predecessor_project_id: str = Field(
        ..., description="The project ID of the predecessor task.")
    predecessor_task_number: int = Field(
        ..., description="The task number of the predecessor task.")
    successor_project_id: str = Field(
        ..., description="The project ID of the successor task.")
    successor_task_number: int = Field(
        ..., description="The task number of the successor task.")
    type: str = Field(
        ..., description="Type of dependency (e.g., 'finishes_to_start').")

class TaskDependencyCreate(TaskDependencyBase):
    """Schema for creating a new task dependency."""
    pass  # All fields directly from base for creation

class TaskDependency(TaskDependencyBase):
    """Schema for representing a task dependency in API responses."""  # Depending on the model structure, you might include IDs for the association record itself  # Or related task objects (using forward references if needed and model_rebuild)
    predecessor: Optional[Task] = Field(None, description="The predecessor task (populated from ORM).")
    successor: Optional[Task] = Field(None, description="The successor task (populated from ORM).")

    model_config = ConfigDict(from_attributes=True)  # Note: model_rebuild() is called in main.py after all schemas are loaded
