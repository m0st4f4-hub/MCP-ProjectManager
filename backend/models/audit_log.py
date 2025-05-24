# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from ..database import Base
from .types import JSONText # Import custom type

class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    user_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey(
        "users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String)
    entity_type: Mapped[str] = mapped_column(String)
    entity_id: Mapped[str] = mapped_column(String)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONText, nullable=True)

    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs") 