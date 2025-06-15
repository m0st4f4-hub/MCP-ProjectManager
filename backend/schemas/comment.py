"""
Simple comment schema for single-user mode.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class CommentBase(BaseModel):
    """Base schema for comment attributes."""
    content: str = Field(..., description="Content of the comment.")


class CommentCreate(CommentBase):
    """Schema for creating a new comment."""
    pass


class CommentUpdate(BaseModel):
    """Schema for updating an existing comment."""
    content: Optional[str] = None


class Comment(CommentBase):
    """Schema for representing a comment in API responses."""
    id: str = Field(..., description="Unique identifier for the comment.")
    created_at: datetime = Field(..., description="When the comment was created.")
    updated_at: datetime = Field(..., description="When the comment was last updated.")

    model_config = ConfigDict(from_attributes=True)