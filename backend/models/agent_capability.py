# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional
import uuid

from .base import Base

class AgentCapability(Base):
    """Capabilities that an agent role can perform"""
    __tablename__ = "agent_capabilities"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    capability: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="capabilities")
