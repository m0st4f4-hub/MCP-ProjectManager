from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentVerificationRequirementBase(BaseModel):
    """Base schema for verification requirements."""

    agent_role_id: str = Field(..., description="Related agent role ID")
    requirement: str = Field(..., description="Verification requirement text")
    description: Optional[str] = Field(
        None, description="Optional description of the requirement."
    )
    is_mandatory: bool = Field(True, description="Whether this requirement is mandatory")


class AgentVerificationRequirementCreate(AgentVerificationRequirementBase):
    """Schema for creating a verification requirement."""

    pass


class AgentVerificationRequirement(AgentVerificationRequirementBase):
    """Schema representing a verification requirement."""

    id: str = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Time requirement was created")

    model_config = ConfigDict(from_attributes=True)
