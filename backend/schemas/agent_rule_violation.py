# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# --- Agent Rule Violation Schemas ---
class AgentRuleViolationBase(BaseModel):
    """Base schema for agent rule violation attributes."""
    agent_id: str = Field(..., description="ID of the agent that violated the rule.")
    violation_type: str = Field(..., description="Type of rule that was violated.")
    rule_id: str = Field(..., description="ID of the specific rule violated.")
    violation_description: str = Field(..., description="Description of the violation.")
    severity: str = Field(..., description="Severity of the violation.")
    context_data: Optional[str] = Field(None, description="Additional context data.")


class AgentRuleViolationCreate(AgentRuleViolationBase):
    pass


class AgentRuleViolation(AgentRuleViolationBase):
    """Schema for representing an agent rule violation in API responses."""
    id: str = Field(..., description="Unique identifier for the violation.")
    created_at: datetime = Field(..., description="Timestamp when the violation was recorded.")

    model_config = ConfigDict(from_attributes=True) 