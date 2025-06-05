"""
Task Manager Backend - Core models import fix.
"""

from sqlalchemy import (
    String,
    Integer,
    Boolean,
    ForeignKey,
    Text,
    PrimaryKeyConstraint,
    DateTime,
    Enum,
    Index
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional
from datetime import datetime

from .base import Base, BaseModel, ArchivedMixin
from ..enums import TaskStatusEnum


class Task(Base, BaseModel, ArchivedMixin):
    """Represents a single task in the Project Manager."""
    __tablename__ = "tasks"
    __table_args__ = (
        PrimaryKeyConstraint('project_id', 'task_number', name='pk_tasks'),
        Index('ix_tasks_created_at', 'created_at'),
        Index('ix_tasks_agent_id', 'agent_id'),
        Index('ix_tasks_project_id', 'project_id'),
        {"sqlite_autoincrement": True},
    )

    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"), index=True)
    task_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    agent_id: Mapped[Optional[str]] = mapped_column(
        String(32), ForeignKey("agents.id"), nullable=True, index=True)
    status: Mapped[TaskStatusEnum] = mapped_column(Enum(TaskStatusEnum), default=TaskStatusEnum.TO_DO)
    assigned_to: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("users.id"), nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    agent = relationship("Agent", back_populates="tasks")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="task")
    
    # Add task dependency relationships
    dependencies_as_predecessor: Mapped[List["TaskDependency"]] = relationship(
        "TaskDependency", 
        back_populates="predecessor", 
        foreign_keys="[TaskDependency.predecessor_project_id, TaskDependency.predecessor_task_number]",
        cascade="all, delete-orphan"
    )
    dependencies_as_successor: Mapped[List["TaskDependency"]] = relationship(
        "TaskDependency", 
        back_populates="successor", 
        foreign_keys="[TaskDependency.successor_project_id, TaskDependency.successor_task_number]",
        cascade="all, delete-orphan"
    )
    
    # Add task file association relationship
    task_files: Mapped[List["TaskFileAssociation"]] = relationship(
        "TaskFileAssociation", 
        back_populates="task", 
        foreign_keys="[TaskFileAssociation.task_project_id, TaskFileAssociation.task_task_number]",
        cascade="all, delete-orphan"
    )
    
    @property
    def id(self) -> str:
        """Provide a composite ID for backward compatibility with tests and APIs."""
        return f"{self.project_id}:{self.task_number}"
    
    @property
    def ai_agent_id(self) -> Optional[str]:
        """Alias for agent_id to maintain backward compatibility."""
        return self.agent_id


class TaskStatus(Base):
    """Status definitions for tasks."""
    __tablename__ = "task_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    is_final: Mapped[bool] = mapped_column(Boolean, default=False)
