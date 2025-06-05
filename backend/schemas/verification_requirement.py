from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class VerificationRequirementBase(BaseModel):
    """Base schema for agent verification requirements."""
    requirement: str = Field(..., description="Name of the verification action.")
    description: Optional[str] = Field(None, description="Detailed description.")
    is_mandatory: bool = Field(True, description="Whether the verification is mandatory.")

class VerificationRequirementCreate(VerificationRequirementBase):
    """Schema for creating a verification requirement."""
    pass

class VerificationRequirement(VerificationRequirementBase):
    """Schema returned in API responses."""
    id: str = Field(..., description="Unique requirement identifier.")
    agent_role_id: str = Field(..., description="Associated agent role ID.")
    created_at: datetime = Field(..., description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True)
