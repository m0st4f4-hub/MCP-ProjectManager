# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Union, Any, Dict
from datetime import datetime

# Forward references for relationships
Task = "backend.schemas.task.Task"

# --- Agent Schemas ---
class AgentBase(BaseModel):
    """Base schema for agent attributes."""
    name: str = Field(..., description="The unique name of the agent.")
    is_archived: bool = Field(False, description="Whether the agent is archived.")


class AgentCreate(AgentBase):
    """Schema for creating a new agent. Inherits attributes from AgentBase."""
    pass


# Schema for updating an agent (all fields optional)
class AgentUpdate(BaseModel):
    """Schema for updating an existing agent. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the agent.")
    is_archived: Optional[bool] = Field(None, description="Set the archived status of the agent.")


class Agent(AgentBase):
    """Schema for representing an agent in API responses (read operations)."""
    id: str = Field(..., description="Unique identifier for the agent.")
    created_at: datetime = Field(...,
                                 description="Timestamp when the agent was created.")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the agent was last updated.")
    tasks: List[Task] = Field(
        [], description="Tasks currently assigned to this agent (populated from ORM).")
    agent_rules: List["AgentRule"] = Field(
        [], description="Rules associated with this agent (populated from ORM).")

    model_config = ConfigDict(from_attributes=True)


# --- Agent Rule Definition Schemas (based on models.AgentRule table) ---
class AgentRuleBase(BaseModel):
    """Base schema for agent rule attributes.
    Corresponds to the fields in the 'agent_rules' table.
    """
    agent_id: str = Field(..., description="ID of the agent this rule is associated with.")
    rule_type: str = Field(..., description="Type of the rule (e.g., 'constraint', 'guideline').")
    rule_content: str = Field(..., description="The actual content/text of the rule.")
    is_active: bool = Field(True, description="Whether the rule is currently active.")

class AgentRuleCreate(AgentRuleBase):
    """Schema for creating a new agent rule.
    Used by crud.agent_rules.
    """
    pass

class AgentRuleUpdate(BaseModel):
    """Schema for updating an existing agent rule.
    All fields are optional. Used by crud.agent_rules.
    """
    agent_id: Optional[str] = Field(None, description="New agent ID for the rule.")
    rule_type: Optional[str] = Field(None, description="New type for the rule.")
    rule_content: Optional[str] = Field(None, description="New content for the rule.")
    is_active: Optional[bool] = Field(None, description="New active status for the rule.")

class AgentRule(AgentRuleBase):
    """Schema for representing an agent rule in API responses (includes ID)."""
    id: str = Field(..., description="Unique identifier for the agent rule.")
    # agent: Optional[Agent] = None # If you want to nest the agent object
    model_config = ConfigDict(from_attributes=True) 