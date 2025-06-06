"""
Audit and logging models.
"""

from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional, List

try:
    from .base import Base, BaseModel, generate_uuid, generate_uuid_with_hyphens
except ImportError:
    from base import Base, BaseModel, generate_uuid, generate_uuid_with_hyphens


class AuditLog(Base, BaseModel):
    """Audit log for tracking system changes."""
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("users.id"), nullable=True)
    project_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("projects.id"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="audit_logs")


class AgentBehaviorLog(Base, BaseModel):
    """Log of agent behaviors and actions for analysis."""
    __tablename__ = "agent_behavior_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid, index=True)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    agent_role_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    action_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    task_project_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("tasks.project_id"), nullable=True)
    task_task_number: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tasks.task_number"), nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    agent_role: Mapped[Optional["AgentRole"]] = relationship("AgentRole")
    task: Mapped[Optional["Task"]] = relationship(
    "Task",
    foreign_keys=[task_project_id, task_task_number],
    primaryjoin="and_(AgentBehaviorLog.task_project_id =="
        "Task.project_id, AgentBehaviorLog.task_task_number == Task.task_number)"
    )


class AgentRuleViolation(Base, BaseModel):
    """Log of rule violations by agents."""
    __tablename__ = "agent_rule_violations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    agent_role_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=True)
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    violated_rule_category: Mapped[str] = mapped_column(String(100), nullable=False)
    violated_rule_identifier: Mapped[str] = mapped_column(Text, nullable=False)
    violation_description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    context_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    task_project_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("tasks.project_id"), nullable=True)
    task_task_number: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tasks.task_number"), nullable=True)

    agent_role: Mapped[Optional["AgentRole"]] = relationship("AgentRole")
    task: Mapped[Optional["Task"]] = relationship(
    "Task",
    foreign_keys=[task_project_id, task_task_number],
    primaryjoin="and_(AgentRuleViolation.task_project_id =="
        "Task.project_id, AgentRuleViolation.task_task_number == Task.task_number)"
    )
