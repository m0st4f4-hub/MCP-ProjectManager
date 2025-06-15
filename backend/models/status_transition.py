"""
Status transition model for tracking task status changes.
Simplified for single-user mode.
"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel


class StatusTransition(Base, BaseModel):
    """
    Model for tracking task status transitions.
    Records when tasks change status in single-user mode.
    """
    __tablename__ = "status_transitions"

    task_id = Column(String(100), nullable=False)  # Composite task ID (project_id:task_number)
    from_status = Column(String(50), nullable=True)  # Null for initial status
    to_status = Column(String(50), nullable=False)
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="status_transitions")
    
    def __repr__(self):
        return f"<StatusTransition(task_id='{self.task_id}', {self.from_status} -> {self.to_status})>"