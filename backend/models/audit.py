"""
Simple audit log model for single-user mode.
"""

from sqlalchemy import Column, String, Text, DateTime, Index
from datetime import datetime

from .base import Base, BaseModel, JSONText


class AuditLog(Base, BaseModel):
    """
    Simple audit log model for tracking system changes in single-user mode.
    """
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index('idx_audit_logs_entity_lookup', 'entity_type', 'entity_id'),
        Index('idx_audit_logs_action_timestamp', 'action', 'timestamp'),
        Index('idx_audit_logs_timestamp', 'timestamp'),
    )

    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=False)
    changes = Column(JSONText, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', entity='{self.entity_type}:{self.entity_id}')>"