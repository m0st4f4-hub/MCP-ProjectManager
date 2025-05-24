# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from ..database import Base

class AgentRole(Base):
    """Agent role definitions that match with Agent names"""
    __tablename__ = "agent_roles"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # Must match Agent.name
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_purpose: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    capabilities: Mapped[List["AgentCapability"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    forbidden_actions: Mapped[List["AgentForbiddenAction"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    verification_requirements: Mapped[List["AgentVerificationRequirement"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    handoff_criteria: Mapped[List["AgentHandoffCriteria"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    error_protocols: Mapped[List["AgentErrorProtocol"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    workflow_steps: Mapped[List["WorkflowStep"]] = relationship(back_populates="agent_role")
    prompt_templates: Mapped[List["AgentPromptTemplate"]] = relationship(back_populates="agent_role") 