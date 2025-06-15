"""
Simple error protocol schema for single-user mode.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class ErrorProtocolBase(BaseModel):
    """Base schema for error protocol attributes."""
    name: str = Field(..., description="Name of the error protocol.")
    description: Optional[str] = Field(None, description="Description of the error protocol.")


class ErrorProtocolCreate(ErrorProtocolBase):
    """Schema for creating a new error protocol."""
    pass


class ErrorProtocolUpdate(BaseModel):
    """Schema for updating an existing error protocol."""
    name: Optional[str] = None
    description: Optional[str] = None


class ErrorProtocol(ErrorProtocolBase):
    """Schema for representing an error protocol in API responses."""
    id: str = Field(..., description="Unique identifier for the error protocol.")
    created_at: datetime = Field(..., description="When the error protocol was created.")
    updated_at: datetime = Field(..., description="When the error protocol was last updated.")

    model_config = ConfigDict(from_attributes=True)