"""
Workflow and agent template models.
"""

from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, Column
from sqlalchemy.orm import relationship
from typing import List, Optional

from .base import Base, BaseModel, generate_uuid


class Workflow(Base, BaseModel):
    """Project workflows."""
    __tablename__ = "workflows"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    workflow_type = Column(String(100), nullable=False)
    entry_criteria = Column(Text, nullable=True)
    success_criteria = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base, BaseModel):
    """Individual steps in a workflow."""
    __tablename__ = "workflow_steps"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    workflow_id = Column(String(32), ForeignKey("workflows.id"), nullable=False)
    agent_role_id = Column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    prerequisites = Column(Text, nullable=True)
    expected_outputs = Column(Text, nullable=True)
    verification_points = Column(Text, nullable=True)
    estimated_duration_minutes = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)

    workflow = relationship("Workflow", back_populates="steps")
    agent_role = relationship("AgentRole", back_populates="workflow_steps")
