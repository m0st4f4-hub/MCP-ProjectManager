"""
Agent Prompt Template Model
"""
from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel, Base, generate_uuid

class AgentPromptTemplate(Base, BaseModel):
    """Prompt templates for different agent roles."""
    __tablename__ = "agent_prompt_templates"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    agent_role_id = Column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    template_name = Column(String(255), nullable=False)
    template_content = Column(Text, nullable=False)
    variables = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    agent_role = relationship("AgentRole", back_populates="prompt_templates") 