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
 agent_name: str = Field(..., description="Name of the agent that violated the rule.")
 agent_role_id: Optional[str] = Field(None, description="ID of the agent's role at the time of violation.")
 violation_type: str = Field(..., description="Type of rule that was violated (e.g., 'forbidden_action', 'missing_capability').")
 violated_rule_category: str = Field(..., description="Category of the violated rule (e.g., 'forbidden_action', 'capability', 'verification_requirement').")
 violated_rule_identifier: str = Field(..., description="Identifier of the specific rule violated (e.g., the forbidden action string, the capability name).")
 violation_description: str = Field(..., description="Description of the violation.")
 severity: str = Field(..., description="Severity of the violation.")
 context_data: Optional[str] = Field(None, description="Additional context data.")
 task_project_id: Optional[str] = Field(None, description="Project ID of the associated task.")
 task_task_number: Optional[int] = Field(None, description="Task number within the project.")

class AgentRuleViolationCreate(AgentRuleViolationBase):
 pass

class AgentRuleViolation(AgentRuleViolationBase):
 """Schema for representing an agent rule violation in API responses."""
 id: str = Field(..., description="Unique identifier for the violation.")
 created_at: datetime = Field(..., description="Timestamp when the violation was recorded.")
 resolved: bool = Field(..., description="Whether the violation has been marked as resolved.")
 resolution_notes: Optional[str] = Field(None, description="Notes on how the violation was resolved.")
 resolved_at: Optional[datetime] = Field(None, description="Timestamp when the violation was resolved.")

 model_config = ConfigDict(from_attributes=True) 