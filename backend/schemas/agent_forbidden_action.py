from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentForbiddenActionBase(BaseModel):
    """Base schema for agent forbidden action."""
    action: str = Field(..., description="Forbidden action name.")
    reason: Optional[str] = Field(None, description="Reason the action is forbidden.")
    is_active: bool = Field(True, description="Whether the rule is active.")


class AgentForbiddenActionCreate(AgentForbiddenActionBase):
    """Schema for creating a forbidden action."""
    pass


class AgentForbiddenAction(AgentForbiddenActionBase):
    """Schema returned from API."""
    id: str = Field(..., description="Unique identifier for the forbidden action.")
    agent_role_id: str = Field(..., description="Associated agent role ID.")
    created_at: datetime = Field(..., description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True)
