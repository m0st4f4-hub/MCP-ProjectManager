# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy import String, Integer, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base

class TaskFileAssociation(Base):
 __tablename__ = "task_file_associations"
 __table_args__ = (PrimaryKeyConstraint('task_project_id', 'task_task_number', 'file_memory_entity_id'),)

 task_project_id: Mapped[str] = mapped_column(
 String(32), ForeignKey("tasks.project_id"))
 task_task_number: Mapped[int] = mapped_column(
 Integer, ForeignKey("tasks.task_number"))
 file_memory_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"), index=True)

 task: Mapped["Task"] = relationship(
 back_populates="task_files",
 primaryjoin="and_(Task.project_id == TaskFileAssociation.task_project_id, Task.task_number == TaskFileAssociation.task_task_number)",
 cascade="all, delete-orphan",
 single_parent=True
 )
 file_entity: Mapped["MemoryEntity"] = relationship() 