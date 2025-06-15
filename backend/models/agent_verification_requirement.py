# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Boolean, ForeignKey, DateTime, Text, Column
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from typing import Optional
import uuid

from .base import Base

class AgentVerificationRequirement(Base):
    """Verification requirements for an agent role"""
    __tablename__ = "agent_verification_requirements"

    id = Column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id = Column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    requirement = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_mandatory = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("AgentRole", back_populates="verification_requirements")
