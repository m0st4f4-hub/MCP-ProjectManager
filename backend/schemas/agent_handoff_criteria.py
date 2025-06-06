from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentHandoffCriteriaBase(BaseModel):
    """Base attributes for agent handoff criteria."""
    criteria: str = Field(..., description="Condition that triggers a handoff.")
    description: Optional[str] = Field(None, description="Details about the criteria.")
    target_agent_role: Optional[str] = Field(
        None, description="Agent role that should take over when criteria match."
    )
    is_active: bool = Field(True, description="Whether the criteria is active.")


class AgentHandoffCriteriaCreate(AgentHandoffCriteriaBase):
    """Schema for creating a handoff criteria."""
    agent_role_id: str = Field(..., description="ID of the owning agent role.")


class AgentHandoffCriteriaUpdate(BaseModel):
    """Schema for updating a handoff criteria."""
    criteria: Optional[str] = Field(None, description="Updated criteria.")
    description: Optional[str] = Field(None, description="Updated description.")
    target_agent_role: Optional[str] = Field(None, description="Updated target role.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")


class AgentHandoffCriteria(AgentHandoffCriteriaBase):
    """Representation of handoff criteria."""
    id: str = Field(..., description="Unique identifier.")
    agent_role_id: str = Field(..., description="ID of the owning agent role.")
    created_at: datetime = Field(..., description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True)
