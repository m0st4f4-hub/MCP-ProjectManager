# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

"""Pydantic schemas for Project Templates."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime

# --- ProjectTemplate Schemas ---

class ProjectTemplateBase(BaseModel):
    """Base schema for project template attributes."""
    name: str = Field(..., description="Unique name for the project template.")
    description: Optional[str] = Field(None, description="Description of the project template.")
    template_data: Dict[str, Any] = Field(..., description="The template structure (e.g., default tasks, roles) in JSON format.")


class ProjectTemplateCreate(ProjectTemplateBase):
    """Schema for creating a new project template."""
    pass


class ProjectTemplateUpdate(BaseModel):
    """Schema for updating an existing project template. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the project template.")
    description: Optional[str] = Field(None, description="New description for the project template.")
    template_data: Optional[Dict[str, Any]] = Field(None, description="New template structure in JSON format.")


class ProjectTemplate(ProjectTemplateBase):
    """Schema for representing a project template in API responses."""
    id: str = Field(..., description="Unique identifier for the project template.")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 