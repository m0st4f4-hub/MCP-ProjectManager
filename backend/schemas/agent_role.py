# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# --- Agent Role Schemas ---
class AgentRoleBase(BaseModel):
 """Base schema for agent role attributes."""
 name: str = Field(..., description="The unique name of the agent role.")
 display_name: str = Field(..., description="Display name for the agent role.")
 primary_purpose: str = Field(..., description="Primary purpose of the agent role.")
 is_active: bool = Field(True, description="Whether the role is active.")

class AgentRoleCreate(AgentRoleBase):
 """Schema for creating a new agent role."""
 pass

class AgentRoleUpdate(BaseModel):
 """Schema for updating an existing agent role."""
 name: Optional[str] = Field(None, description="Updated name of the role.")
 display_name: Optional[str] = Field(None, description="Updated display name.")
 primary_purpose: Optional[str] = Field(None, description="Updated primary purpose.")
 is_active: Optional[bool] = Field(None, description="Updated active status.")

class AgentRole(AgentRoleBase):
 """Schema for representing an agent role in API responses."""
 id: str = Field(..., description="Unique identifier for the role.")
 created_at: datetime = Field(..., description="Timestamp when the role was created.")
 updated_at: datetime = Field(..., description="Timestamp when the role was last updated.")

 model_config = ConfigDict(from_attributes=True) 