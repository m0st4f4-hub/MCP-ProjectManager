"""
Project member model - Simplified for single-user mode.
This model may not be needed in single-user mode but kept for compatibility.
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .base import Base, BaseModel


class ProjectMemberRole(enum.Enum):
    """Project member roles."""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class ProjectMember(Base, BaseModel):
    """
    Project member model - Simplified for single-user mode.
    May not be actively used but kept for schema compatibility.
    """
    __tablename__ = "project_members"

    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    user_identifier = Column(String(255), nullable=False, default="local_user")
    role = Column(Enum(ProjectMemberRole), default=ProjectMemberRole.OWNER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="project_members")

    def __repr__(self):
        return f"<ProjectMember(project_id={self.project_id}, role={self.role.value})>"