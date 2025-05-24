# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# --- Workflow Schemas ---
class WorkflowBase(BaseModel):
    """Base schema for workflow attributes."""
    name: str = Field(..., description="The name of the workflow.")
    description: Optional[str] = Field(None, description="Description of the workflow.")
    workflow_type: str = Field(..., description="Type of the workflow.")
    entry_criteria: Optional[str] = Field(None, description="Entry criteria for the workflow.")
    success_criteria: Optional[str] = Field(None, description="Success criteria for the workflow.")
    is_active: bool = Field(True, description="Whether the workflow is active.")


class WorkflowCreate(WorkflowBase):
    """Schema for creating a new workflow."""
    pass


class WorkflowUpdate(BaseModel):
    """Schema for updating an existing workflow."""
    name: Optional[str] = Field(None, description="Updated name of the workflow.")
    description: Optional[str] = Field(None, description="Updated description.")
    workflow_type: Optional[str] = Field(None, description="Updated workflow type.")
    entry_criteria: Optional[str] = Field(None, description="Updated entry criteria.")
    success_criteria: Optional[str] = Field(None, description="Updated success criteria.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")


class Workflow(WorkflowBase):
    """Schema for representing a workflow in API responses."""
    id: str = Field(..., description="Unique identifier for the workflow.")
    created_at: datetime = Field(..., description="Timestamp when the workflow was created.")
    updated_at: datetime = Field(..., description="Timestamp when the workflow was last updated.")

    model_config = ConfigDict(from_attributes=True) 