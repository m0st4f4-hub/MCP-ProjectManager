# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy import String, Integer, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base

class ProjectFileAssociation(Base):
    __tablename__ = "project_file_associations"
    __table_args__ = (PrimaryKeyConstraint('project_id', 'file_memory_entity_id'),)

    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id"))
    file_memory_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"), index=True)

    project: Mapped["Project"] = relationship(back_populates="project_files")
    file_entity: Mapped["MemoryEntity"] = relationship() 