# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# --- Agent Behavior Log Schemas ---


class AgentBehaviorLogBase(BaseModel):
    """Base schema for agent behavior log attributes."""
    agent_id: str = Field(
        ..., description="ID of the agent."
    )
    action_type: str = Field(
        ..., description="Type of action performed."
    )
    action_description: str = Field(
        ..., description="Description of the action."
    )
    context_data: Optional[str] = Field(
        None, description="Additional context data."
    )
    outcome: Optional[str] = Field(
        None, description="Outcome of the action."
    )


class AgentBehaviorLogCreate(AgentBehaviorLogBase):
    pass


class AgentBehaviorLog(AgentBehaviorLogBase):
    """Schema for representing an agent behavior log in API responses."""
    id: str = Field(
        ..., description="Unique identifier for the log entry."
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the log was created."
    )

    model_config = ConfigDict(from_attributes=True)
