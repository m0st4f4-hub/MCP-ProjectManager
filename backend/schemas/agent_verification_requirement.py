from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentVerificationRequirementBase(BaseModel):
    """Base schema for agent verification requirements."""

    agent_role_id: str = Field(..., description="ID of the related agent role.")
    requirement: str = Field(..., description="Verification requirement text.")
    description: Optional[str] = Field(
        None, description="Optional description of the requirement."
    )
    is_mandatory: bool = Field(
        True, description="Whether this verification is mandatory."
    )


class AgentVerificationRequirementCreate(AgentVerificationRequirementBase):
    """Schema for creating a verification requirement."""

    pass


class AgentVerificationRequirementUpdate(BaseModel):
    """Schema for updating a verification requirement."""

    requirement: Optional[str] = Field(None, description="Updated requirement text.")
    description: Optional[str] = Field(None, description="Updated description.")
    is_mandatory: Optional[bool] = Field(None, description="Updated mandatory flag.")


class AgentVerificationRequirement(AgentVerificationRequirementBase):
    """Schema representing a verification requirement."""

    id: str = Field(..., description="Unique identifier for the requirement.")
    created_at: datetime = Field(
        ..., description="Timestamp the requirement was created."
    )

    model_config = ConfigDict(from_attributes=True)
