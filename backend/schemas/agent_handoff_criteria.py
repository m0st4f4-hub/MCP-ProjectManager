from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentHandoffCriteriaBase(BaseModel):
    """Base schema for agent handoff criteria."""

    agent_role_id: str = Field(..., description="ID of the related agent role.")
    criteria: str = Field(..., description="Handoff trigger criteria.")
    description: Optional[str] = Field(
        None, description="Optional description of the criteria."
    )
    target_agent_role: Optional[str] = Field(
        None, description="Suggested target agent role for handoff."
    )
    is_active: bool = Field(True, description="Whether this criteria is active.")


class AgentHandoffCriteriaCreate(AgentHandoffCriteriaBase):
    """Schema for creating handoff criteria."""

    pass


class AgentHandoffCriteriaUpdate(BaseModel):
    """Schema for updating handoff criteria."""

    agent_role_id: Optional[str] = Field(
        None, description="ID of the related agent role."
    )
    criteria: Optional[str] = Field(
        None, description="Handoff trigger criteria."
    )
    description: Optional[str] = Field(
        None, description="Optional description of the criteria."
    )
    target_agent_role: Optional[str] = Field(
        None, description="Suggested target agent role for handoff."
    )
    is_active: Optional[bool] = Field(
        None, description="Whether this criteria is active."
    )


class AgentHandoffCriteria(AgentHandoffCriteriaBase):
    """Schema representing handoff criteria."""

    id: str = Field(..., description="Unique identifier for the criteria.")
    created_at: datetime = Field(..., description="Timestamp the criteria was created.")

    model_config = ConfigDict(from_attributes=True)
