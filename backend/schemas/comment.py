# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Forward references for relationships
Task = "backend.schemas.task.Task"
Project = "backend.schemas.project.Project"
User = "backend.schemas.user.User"

# --- Comment Schemas ---
class CommentBase(BaseModel):
    """Base schema for comment attributes."""
    task_project_id: Optional[str] = Field(None, description="The ID of the associated task's project (if applicable).")
    task_task_number: Optional[int] = Field(None, description="The number of the associated task within its project (if applicable).")
    project_id: Optional[str] = Field(None, description="The ID of the associated project (if applicable).")
    author_id: str = Field(..., description="The ID of the author of the comment.")
    content: str = Field(..., description="The content of the comment.")


class CommentCreate(CommentBase):
    """Schema for creating a new comment."""
    pass


class CommentUpdate(CommentBase):
    """Schema for updating an existing comment."""
    # All fields are optional for updates
    task_project_id: Optional[str] = Field(None, description="The ID of the associated task's project (if applicable).")
    task_task_number: Optional[int] = Field(None, description="The number of the associated task within its project (if applicable).")
    project_id: Optional[str] = Field(None, description="The ID of the associated project (if applicable).")
    author_id: Optional[str] = Field(None, description="The ID of the author of the comment.")
    content: Optional[str] = Field(None, description="The content of the comment.")


class Comment(CommentBase):
    """Schema for representing a comment in API responses."""
    id: str = Field(...,
                    description="Unique identifier for the comment.")
    created_at: datetime = Field(..., description="Timestamp when the comment was created.")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the comment was last updated.")

    # Relationships
    task: Optional[Task] = Field(None, description="The task this comment is on (if applicable).")
    project: Optional[Project] = Field(None, description="The project this comment is on (if applicable).")
    author: User = Field(..., description="The author of the comment.") # Author is not optional in model

    model_config = ConfigDict(from_attributes=True) 