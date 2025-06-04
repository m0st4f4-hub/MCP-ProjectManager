# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional
import uuid

from .base import Base

class AgentForbiddenAction(Base):
    """Actions that an agent role is forbidden from performing"""
    __tablename__ = "agent_forbidden_actions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="forbidden_actions")
