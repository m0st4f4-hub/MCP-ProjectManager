"""
Project models - consolidated and simplified.
"""

from sqlalchemy import String, Integer, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional

from .base import Base, BaseModel, ArchivedMixin, ProjectMemberRole, generate_uuid_with_hyphens

# Import the Comment model here to define the relationship
from .comment import Comment

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
    # Add the missing comments_on_project relationship
    comments_on_project: Mapped[List["Comment"]] = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    # Add the project_files relationship defined in the ProjectFileAssociation model
    project_files = relationship("ProjectFileAssociation", back_populates="project", cascade="all, delete-orphan")


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
    # Remove redundant file path, name, and type columns
    # file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    # file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # file_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Retain and rely on file_memory_entity_id and the relationship
    file_memory_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"), index=True)

    # Correct the relationship to point to Project and use back_populates
    project: Mapped["Project"] = relationship("Project", back_populates="project_files")
    # Use back_populates to match MemoryEntity.project_file_associations
    file_entity: Mapped["MemoryEntity"] = relationship("MemoryEntity", back_populates="project_file_associations")
