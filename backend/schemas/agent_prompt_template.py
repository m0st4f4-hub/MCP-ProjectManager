# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# --- Agent Prompt Template Schemas ---
class AgentPromptTemplateBase(BaseModel):
 """Base schema for agent prompt template attributes."""
 template_name: str = Field(..., description="Name of the prompt template.")
 template_content: str = Field(..., description="Content of the prompt template.")
 context_requirements: Optional[str] = Field(None, description="Context requirements for the template.")
 is_active: bool = Field(True, description="Whether the template is active.")

class AgentPromptTemplateCreate(AgentPromptTemplateBase):
 """Schema for creating a new agent prompt template."""
 agent_role_id: str = Field(..., description="ID of the associated agent role.")

class AgentPromptTemplateUpdate(BaseModel):
 """Schema for updating an existing agent prompt template."""
 template_name: Optional[str] = Field(None, description="Updated template name.")
 template_content: Optional[str] = Field(None, description="Updated template content.")
 context_requirements: Optional[str] = Field(None, description="Updated context requirements.")
 is_active: Optional[bool] = Field(None, description="Updated active status.")

class AgentPromptTemplate(AgentPromptTemplateBase):
 """Schema for representing an agent prompt template in API responses."""
 id: str = Field(..., description="Unique identifier for the template.")
 agent_role_id: str = Field(..., description="ID of the associated agent role.")
 created_at: datetime = Field(..., description="Timestamp when the template was created.")
 updated_at: datetime = Field(..., description="Timestamp when the template was last updated.")

 model_config = ConfigDict(from_attributes=True) 