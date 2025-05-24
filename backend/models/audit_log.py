"""Audit Log model to track user and system actions."""

from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB # For PostgreSQL
# from sqlalchemy import JSON # For SQLite or other DBs that support JSON type
from typing import Optional
import datetime

from .base import Base, generate_uuid_with_hyphens # Assuming BaseModel provides id, created_at, updated_at

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {'extend_existing': True}

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    user_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String, index=True) # e.g., 'user_login', 'create_project'
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, index=True)
    details: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True) # Using JSONB for PostgreSQL
    # For SQLite or other dbs, consider using Text and handling JSON manually or using sqlalchemy.JSON
    # details: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Alternative for non-JSON supporting DBs

    # Relationship to User (optional, as user_id can be null for system actions)
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog(id={self.id}, user_id={self.user_id}, action='{self.action}', timestamp={self.timestamp})>" 