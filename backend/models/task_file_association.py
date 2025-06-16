# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import String, Integer, ForeignKey, PrimaryKeyConstraint, ForeignKeyConstraint
from sqlalchemy.orm import relationship

from .base import Base

class TaskFileAssociation(Base):
    __tablename__ = "task_file_associations"
    __table_args__ = (
        PrimaryKeyConstraint('task_project_id', 'task_task_number', 'file_memory_entity_id'),
        ForeignKeyConstraint(['task_project_id', 'task_task_number'], 
                           ['tasks.project_id', 'tasks.task_number']),
    )

    task_project_id = Column(String(32))
    task_task_number = Column(Integer)
    file_memory_entity_id = Column(Integer, ForeignKey("memory_entities.id"), index=True)

    task = relationship(
        "Task",
        back_populates="task_files",
        primaryjoin="and_(Task.project_id == TaskFileAssociation.task_project_id,"
                   "Task.task_number == TaskFileAssociation.task_task_number)",
        foreign_keys=[task_project_id, task_task_number]
    )
    file_entity = relationship("MemoryEntity", back_populates="task_file_associations")
