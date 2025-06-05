from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentVerificationRequirementBase(BaseModel):
    """Base schema for agent verification requirements."""

    agent_role_id: str = Field(..., description="ID of the related agent role.")
    requirement: str = Field(..., description="The verification requirement.")
    description: Optional[str] = Field(None, description="Optional description.")
    is_mandatory: bool = Field(
        True,
        description="Whether the requirement is mandatory.",
    )


class AgentVerificationRequirementCreate(AgentVerificationRequirementBase):
    """Schema for creating a verification requirement."""

    pass


class AgentVerificationRequirement(AgentVerificationRequirementBase):
    """Schema representing a verification requirement."""

    id: str = Field(..., description="Unique identifier of the requirement.")
    created_at: datetime = Field(..., description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True)
