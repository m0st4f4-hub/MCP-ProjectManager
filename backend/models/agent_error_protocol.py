# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, Column
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from .base import Base

class AgentErrorProtocol(Base):
    """Error handling protocols for agent roles"""
    __tablename__ = "agent_error_protocols"

    id = Column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id = Column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    error_type = Column(String(100), nullable=False)
    protocol = Column(Text, nullable=False)
    priority = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("AgentRole", back_populates="error_protocols")
