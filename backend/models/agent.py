"""
Core agent models.
"""

from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from typing import List, TYPE_CHECKING

from .base import Base, BaseModel, ArchivedMixin, generate_uuid

if TYPE_CHECKING:
    from .task import Task


class Agent(Base, BaseModel, ArchivedMixin):
    """Represents an agent that can be assigned to tasks."""
    __tablename__ = "agents"

    id = Column(String(32), primary_key=True, index=True, default=generate_uuid)
    name = Column(String(255), index=True, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    tasks = relationship("Task", back_populates="agent", cascade="all, delete-orphan")
    agent_rules = relationship("AgentRule", back_populates="agent", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Agent(id={self.id}, name='{self.name}')>"


class AgentRule(Base, BaseModel):
    """Rules and constraints for agents."""
    __tablename__ = "agent_rules"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    agent_id = Column(String(32), ForeignKey("agents.id"), nullable=False)
    rule_type = Column(String(100), nullable=False)
    rule_content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    agent = relationship("Agent", back_populates="agent_rules")

    def __repr__(self):
        return f"<AgentRule(id={self.id}, agent_id={self.agent_id}, type='{self.rule_type}')>"


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
