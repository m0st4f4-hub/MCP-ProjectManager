from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class VerificationRequirementBase(BaseModel):
    """Base schema for verification requirements."""
    agent_role_id: str = Field(..., description="ID of the related agent role")
    requirement: str = Field(..., description="Verification requirement")
    description: Optional[str] = Field(None, description="Optional description")
    is_mandatory: bool = Field(True, description="Whether the requirement is mandatory")

class VerificationRequirementCreate(VerificationRequirementBase):
    """Schema for creating a verification requirement."""
    pass

class VerificationRequirement(VerificationRequirementBase):
    """Schema representing a verification requirement."""
    id: str = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)
