# Task ID: rules_initialization_fix  # Agent Role: ImplementationSpecialist  # Request ID: rules_integration  # Project: task-manager  # Timestamp: 2023-10-26T10:00:00Z

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime  # --- Workflow Step Schemas ---


class WorkflowStepBase(BaseModel):
    """Base schema for workflow step attributes."""
    workflow_id: str = Field(..., description="The ID of the workflow this step belongs to.")
    agent_role_id: str = Field(..., description="The ID of the agent role responsible for this step.")
    step_order: int = Field(..., description="The order of this step within the workflow.")
    title: str = Field(..., description="The title of the workflow step.")
    description: Optional[str] = Field(None, description="Description of the workflow step.")
    prerequisites: Optional[str] = Field(None, description="Prerequisites for this step.")
    expected_outputs: Optional[str] = Field(None, description="Expected outputs of this step.")
    verification_points: Optional[str] = Field(None, description="Points to verify after this step.")
    estimated_duration_minutes: Optional[int] = Field(None, description="Estimated duration in minutes.")
    is_active: bool = Field(True, description="Whether the workflow step is active.")

class WorkflowStepCreate(WorkflowStepBase):
    """Schema for creating a new workflow step."""
    model_config = ConfigDict(from_attributes=True)

class WorkflowStepUpdate(BaseModel):
    """Schema for updating an existing workflow step."""
    workflow_id: Optional[str] = Field(None, description="The ID of the workflow this step belongs to.")
    agent_role_id: Optional[str] = Field(None, description="The ID of the agent role responsible for this step.")
    step_order: Optional[int] = Field(None, description="The order of this step within the workflow.")
    title: Optional[str] = Field(None, description="Updated title of the workflow step.")
    description: Optional[str] = Field(None, description="Updated description.")
    prerequisites: Optional[str] = Field(None, description="Updated prerequisites.")
    expected_outputs: Optional[str] = Field(None, description="Updated expected outputs.")
    verification_points: Optional[str] = Field(None, description="Updated verification points.")
    estimated_duration_minutes: Optional[int] = Field(None, description="Updated estimated duration in minutes.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")

class WorkflowStep(WorkflowStepBase):
    """Schema for representing a workflow step in API responses."""
    id: str = Field(..., description="Unique identifier for the workflow step.")
    created_at: datetime = Field(..., description="Timestamp when the workflow step was created.")
    updated_at: datetime = Field(..., description="Timestamp when the workflow step was last updated.")

    model_config = ConfigDict(from_attributes=True)
