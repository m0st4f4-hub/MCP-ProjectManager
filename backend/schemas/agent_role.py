"""
Simple agent role schema for single-user mode.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentRoleBase(BaseModel):
    """Base schema for agent role attributes."""
    name: str = Field(..., description="Name of the agent role.")
    description: Optional[str] = Field(None, description="Description of the agent role.")


class AgentRoleCreate(AgentRoleBase):
    """Schema for creating a new agent role."""
    pass


class AgentRoleUpdate(BaseModel):
    """Schema for updating an existing agent role."""
    name: Optional[str] = None
    description: Optional[str] = None


class AgentRole(AgentRoleBase):
    """Schema for representing an agent role in API responses."""
    id: str = Field(..., description="Unique identifier for the agent role.")
    created_at: datetime = Field(..., description="When the agent role was created.")
    updated_at: datetime = Field(..., description="When the agent role was last updated.")

    model_config = ConfigDict(from_attributes=True)