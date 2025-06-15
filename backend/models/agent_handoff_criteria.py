# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey, Column
from sqlalchemy.orm import relationship
from typing import Optional
from datetime import datetime, timezone
import uuid

from .base import Base

class AgentHandoffCriteria(Base):
    """Criteria for when an agent hands off to another agent"""
    __tablename__ = "agent_handoff_criteria"

    id = Column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id = Column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    criteria = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_agent_role = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("AgentRole", back_populates="handoff_criteria")
