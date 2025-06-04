"""
Core agent models.
"""

from sqlalchemy import String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List

from .base import Base, BaseModel, ArchivedMixin, generate_uuid


class Agent(Base, BaseModel, ArchivedMixin):
    """Represents an agent that can be assigned to tasks."""
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String, index=True, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    tasks: Mapped[List["Task"]] = relationship(
        back_populates="agent", cascade="all, delete-orphan")
    agent_rules: Mapped[List["AgentRule"]] = relationship(
        back_populates="agent", cascade="all, delete-orphan")


class AgentRule(Base):
    """Rules and constraints for agents."""
    __tablename__ = "agent_rules"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    agent_id: Mapped[str] = mapped_column(String(32), ForeignKey("agents.id"))
    rule_type: Mapped[str] = mapped_column(String)
    rule_content: Mapped[Text] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    agent: Mapped["Agent"] = relationship(back_populates="agent_rules")


class AgentRole(Base, BaseModel):
    """Agent role definitions that match with Agent names."""
    __tablename__ = "agent_roles"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_purpose: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    capabilities: Mapped[List["AgentCapability"]] = relationship(
        back_populates="agent_role", cascade="all, delete-orphan")
    forbidden_actions: Mapped[List["AgentForbiddenAction"]] = relationship(
        back_populates="agent_role", cascade="all, delete-orphan")
    verification_requirements: Mapped[List["AgentVerificationRequirement"]] = relationship(
        back_populates="agent_role", cascade="all, delete-orphan")
    handoff_criteria: Mapped[List["AgentHandoffCriteria"]] = relationship(
        back_populates="agent_role", cascade="all, delete-orphan")
    error_protocols: Mapped[List["AgentErrorProtocol"]] = relationship(
        back_populates="agent_role", cascade="all, delete-orphan")
    workflow_steps: Mapped[List["WorkflowStep"]] = relationship(back_populates="agent_role")
    prompt_templates: Mapped[List["AgentPromptTemplate"]] = relationship(back_populates="agent_role")
