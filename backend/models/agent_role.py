"""
Agent Role Model
"""
from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel, Base, generate_uuid

class AgentRole(Base, BaseModel):
    """Agent role definitions that match with Agent names."""
    __tablename__ = "agent_roles"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    primary_purpose = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    capabilities = relationship("AgentCapability", back_populates="agent_role", cascade="all, delete-orphan")
    forbidden_actions = relationship("AgentForbiddenAction", back_populates="agent_role", cascade="all, delete-orphan")
    verification_requirements = relationship("AgentVerificationRequirement", back_populates="agent_role", cascade="all, delete-orphan")
    handoff_criteria = relationship("AgentHandoffCriteria", back_populates="agent_role", cascade="all, delete-orphan")
    error_protocols = relationship("AgentErrorProtocol", back_populates="agent_role", cascade="all, delete-orphan")
    workflow_steps = relationship("WorkflowStep", back_populates="agent_role")
    prompt_templates = relationship("AgentPromptTemplate", back_populates="agent_role")

    def __repr__(self):
        return f"<AgentRole(id={self.id}, name='{self.name}', display_name='{self.display_name}')>" 