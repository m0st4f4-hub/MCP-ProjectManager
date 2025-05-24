# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

# --- Project Template Schemas ---
class ProjectTemplateBase(BaseModel):
    """Base schema for project template attributes."""
    name: str = Field(..., description="The unique name of the project template.")
    description: Optional[str] = Field(
        None, description="Optional text description of the project template.")


class ProjectTemplateCreate(ProjectTemplateBase):
    """Schema for creating a new project template."""
    pass


class ProjectTemplateUpdate(BaseModel):
    """Schema for updating an existing project template. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the project template.")
    description: Optional[str] = Field(
        None, description="New description for the project template.")


class ProjectTemplate(ProjectTemplateBase):
    """Schema for representing a project template."""
    id: str = Field(..., description="Unique identifier for the project template.")

    model_config = ConfigDict(from_attributes=True) 