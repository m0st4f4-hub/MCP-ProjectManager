"""
Project models - consolidated and simplified.
"""

from sqlalchemy import String, Integer, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional

from .base import Base, BaseModel, ArchivedMixin, ProjectMemberRole, generate_uuid_with_hyphens


class Project(Base, BaseModel, ArchivedMixin):
    """Represents a project in the Project Manager."""
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    task_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    project_members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")


class ProjectTemplate(Base):
    """Template for creating projects."""
    __tablename__ = "project_templates"

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=generate_uuid_with_hyphens, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ProjectMember(Base, BaseModel):
    """Project membership and roles."""
    __tablename__ = "project_members"
    __table_args__ = (UniqueConstraint('project_id', 'user_id', name='uq_project_user'),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"))
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String, default="member")

    project = relationship("Project", back_populates="project_members")
    user = relationship("User", back_populates="project_memberships")


class ProjectFileAssociation(Base, BaseModel):
    """Association between projects and files."""
    __tablename__ = "project_file_associations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"))
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    project = relationship("Project")
