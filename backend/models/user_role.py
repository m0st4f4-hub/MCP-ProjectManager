# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy import Column, String, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base # Import Base from backend/database.py


class UserRole(Base):
 __tablename__ = "user_roles"
 __table_args__ = (PrimaryKeyConstraint('user_id', 'role_name'),)

 user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
 role_name: Mapped[str] = mapped_column(
 String) # e.g., "admin", "member", "agent"

 user: Mapped["User"] = relationship(back_populates="user_roles") 