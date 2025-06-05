from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class AgentCapabilityBase(BaseModel):
    """Base schema for agent capabilities."""

    agent_role_id: str = Field(..., description="ID of the related agent role.")
    capability: str = Field(..., description="Name of the capability.")
    description: Optional[str] = Field(
        None, description="Optional description for the capability."
    )
    is_active: bool = Field(True, description="Whether the capability is active.")


class AgentCapabilityCreate(AgentCapabilityBase):
    """Schema for creating an agent capability."""

    pass


class AgentCapabilityUpdate(BaseModel):
    """Schema for updating an agent capability."""

    capability: Optional[str] = Field(None, description="Updated capability name.")
    description: Optional[str] = Field(None, description="Updated description.")
    is_active: Optional[bool] = Field(None, description="Updated active state.")


class AgentCapability(AgentCapabilityBase):
    """Schema representing an agent capability."""

    id: str = Field(..., description="Unique identifier of the capability.")
    created_at: datetime = Field(..., description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True)
