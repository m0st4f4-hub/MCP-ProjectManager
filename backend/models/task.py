"""
Task Model - Simplified for single-user mode
"""

from sqlalchemy import (
    String, Integer, Boolean, ForeignKey, Text, 
    PrimaryKeyConstraint, DateTime, Enum, Index, Column
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, ArchivedMixin
from backend.enums import TaskStatusEnum


class Task(Base, BaseModel, ArchivedMixin):
    """Simplified Task model for single-user mode."""
    __tablename__ = "tasks"
    __table_args__ = (
        PrimaryKeyConstraint('project_id', 'task_number', name='pk_tasks'),
        Index('ix_tasks_created_at', 'created_at'),
        Index('ix_tasks_status', 'status'),
        {"sqlite_autoincrement": True},
    )

    project_id = Column(String(36), ForeignKey("projects.id"), index=True, nullable=False)
    task_number = Column(Integer, nullable=False)
    title = Column(String(500), index=True, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.TO_DO, nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    
    # Dates
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Agent assignment (optional)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True, index=True)
    
    # Relationships (simplified)
    project = relationship("Project", back_populates="tasks")
    
    @property
    def id(self) -> str:
        """Provide a composite ID for backward compatibility."""
        return f"{self.project_id}:{self.task_number}"
    
    def __repr__(self):
        return f"<Task(project_id={self.project_id}, task_number={self.task_number}, title='{self.title}')>"


class TaskStatus(Base):
    """Status definitions for tasks."""
    __tablename__ = "task_statuses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, unique=True, index=True, nullable=False)
    is_final = Column(Boolean, default=False, nullable=False)
    
    def __repr__(self):
        return f"<TaskStatus(name='{self.name}', order={self.order})>"