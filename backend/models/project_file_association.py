"""
Model definition for project file associations.
"""

from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    DateTime,
    PrimaryKeyConstraint
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional

from .base import Base


class ProjectFileAssociation(Base):
    """
    Represents an association between a project and a file (MemoryEntity).

    Attributes:
    project_id: Foreign key linking to the parent Project's ID.
    file_memory_entity_id: Foreign key linking to the MemoryEntity's ID.
    created_at: Timestamp when the association was created.
    project: ORM relationship to the parent Project.
    file_entity: ORM relationship to the MemoryEntity.
    """
    __tablename__ = "project_file_associations"
    __table_args__ = (PrimaryKeyConstraint('project_id', 'file_memory_entity_id'),)

    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id"))
    file_memory_entity_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("memory_entities.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    project: Mapped["Project"] = relationship(back_populates="file_associations")
    file_entity: Mapped["MemoryEntity"] = relationship(back_populates="project_file_associations") 