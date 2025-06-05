from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime


class ErrorProtocolBase(BaseModel):
    """Base schema for error handling protocols."""

    error_type: str = Field(..., description="Type of error this protocol handles")
    handling_strategy: str = Field(..., description="How the error should be handled")
    retry_config: Optional[Dict[str, Any]] = Field(
        None, description="Optional retry configuration details"
    )
    escalation_path: Optional[str] = Field(
        None, description="Escalation path if the error cannot be resolved"
    )
    priority: int = Field(5, description="Protocol priority (lower is higher)")
    is_active: bool = Field(True, description="Whether the protocol is active")


class ErrorProtocolCreate(ErrorProtocolBase):
    """Schema for creating an error protocol."""

    pass


class ErrorProtocolUpdate(BaseModel):
    """Schema for updating an error protocol."""

    error_type: Optional[str] = None
    handling_strategy: Optional[str] = None
    retry_config: Optional[Dict[str, Any]] = None
    escalation_path: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class ErrorProtocol(ErrorProtocolBase):
    """Schema for representing an error protocol."""

    id: str = Field(..., description="Unique identifier of the protocol")
    agent_role_id: str = Field(..., description="ID of the related agent role")
    created_at: datetime = Field(..., description="Timestamp the protocol was created")

    model_config = ConfigDict(from_attributes=True)
