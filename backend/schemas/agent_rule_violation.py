"""
Pydantic schemas for agent rule violations.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AgentRuleViolationBase(BaseModel):
    agent_id: str = Field(..., description="The ID of the agent that violated the rule.")
    rule_id: str = Field(..., description="The ID of the rule that was violated.")
    details: Optional[str] = Field(None, description="Details of the rule violation.")

class AgentRuleViolationCreate(AgentRuleViolationBase):
    pass

class AgentRuleViolation(AgentRuleViolationBase):
    id: str = Field(..., description="The unique ID of the rule violation.")
    created_at: datetime = Field(..., description="The timestamp when the violation occurred.")

    class Config:
        from_attributes = True 