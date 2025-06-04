"""
Workflow and agent template models.
"""

from sqlalchemy import String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional

from .base import Base, BaseModel, generate_uuid


class Workflow(Base, BaseModel):
    """Project workflows."""
    __tablename__ = "workflows"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    workflow_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entry_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    success_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    steps: Mapped[List["WorkflowStep"]] = relationship(back_populates="workflow",
    cascade="all, delete-orphan")


class WorkflowStep(Base, BaseModel):
    """Individual steps in a workflow."""
    __tablename__ = "workflow_steps"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    workflow_id: Mapped[str] = mapped_column(String(32), ForeignKey("workflows.id"), nullable=False)
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prerequisites: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expected_outputs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verification_points: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    workflow: Mapped["Workflow"] = relationship(back_populates="steps")
    agent_role: Mapped["AgentRole"] = relationship(back_populates="workflow_steps")


class AgentPromptTemplate(Base, BaseModel):
    """Prompt templates for different agent roles."""
    __tablename__ = "agent_prompt_templates"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    template_name: Mapped[str] = mapped_column(String(255), nullable=False)
    template_content: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    agent_role: Mapped["AgentRole"] = relationship(back_populates="prompt_templates")
