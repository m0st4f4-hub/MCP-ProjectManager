# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

"""
Model definition for project members.
"""

from sqlalchemy import Column, String, ForeignKey, DateTime, UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional

from ..database import Base


class ProjectMember(Base):
    """
    Represents a user membership in a project.
    
    Attributes:
        project_id: Foreign key linking to the parent Project's ID.
        user_id: Foreign key linking to the User's ID.
        role: The role of the user in the project (e.g., "owner", "member", "viewer").
        created_at: Timestamp when the membership was created.
        updated_at: Timestamp when the membership was last updated.
        project: ORM relationship to the parent Project.
        user: ORM relationship to the User.
    """
    __tablename__ = "project_members"
    __table_args__ = (PrimaryKeyConstraint('project_id', 'user_id'),)

    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id"))
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=True)
    
    # Relationships
    project: Mapped["Project"] = relationship(back_populates="project_members")
    user: Mapped["User"] = relationship(back_populates="project_memberships")
