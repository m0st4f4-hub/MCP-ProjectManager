from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AgentErrorProtocolBase(BaseModel):
    """Base schema for agent error protocols."""

    agent_role_id: str = Field(..., description="ID of the related agent role.")
    error_type: str = Field(..., description="Type of error this protocol handles.")
    protocol: str = Field(..., description="Instructions for handling the error.")
    priority: int = Field(5, description="Priority of the protocol.")
    is_active: bool = Field(True, description="Whether the protocol is active.")


class AgentErrorProtocolCreate(AgentErrorProtocolBase):
    """Schema for creating an error protocol."""

    pass


class AgentErrorProtocolUpdate(BaseModel):
    """Schema for updating an error protocol."""

    error_type: Optional[str] = Field(None, description="Updated error type.")
    protocol: Optional[str] = Field(None, description="Updated protocol text.")
    priority: Optional[int] = Field(None, description="Updated priority.")
    is_active: Optional[bool] = Field(None, description="Updated active state.")


class AgentErrorProtocol(AgentErrorProtocolBase):
    """Schema representing an error protocol."""

    id: str = Field(..., description="Unique identifier of the protocol.")
    created_at: datetime = Field(..., description="Creation timestamp.")

    model_config = ConfigDict(from_attributes=True)
