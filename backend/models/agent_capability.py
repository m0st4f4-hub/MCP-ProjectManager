# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey, Column
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from typing import Optional
import uuid

from .base import Base

class AgentCapability(Base):
    """Capabilities that an agent role can perform"""
    __tablename__ = "agent_capabilities"

    id = Column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id = Column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    capability = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("AgentRole", back_populates="capabilities")
