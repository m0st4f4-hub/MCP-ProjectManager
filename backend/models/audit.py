"""
Audit and logging models.
"""

from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional

from .base import Base, BaseModel, generate_uuid, generate_uuid_with_hyphens


class AuditLog(Base, BaseModel):
    """Audit log for tracking system changes."""
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    user_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(32), nullable=False)
    changes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs")


class AgentRuleViolation(Base, BaseModel):
    """Log of rule violations by agents."""
    __tablename__ = "agent_rule_violations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    agent_id: Mapped[str] = mapped_column(String(32), ForeignKey("agents.id"), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    rule_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_rules.id"), nullable=False)
    violation_description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    context_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    agent: Mapped["Agent"] = relationship()
    rule: Mapped["AgentRule"] = relationship()


class AgentBehaviorLog(Base, BaseModel):
    """Log of agent behaviors and actions for analysis."""
    __tablename__ = "agent_behavior_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid)
    agent_id: Mapped[str] = mapped_column(String(32), ForeignKey("agents.id"), nullable=False)
    task_project_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    task_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    action_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    agent: Mapped["Agent"] = relationship()
