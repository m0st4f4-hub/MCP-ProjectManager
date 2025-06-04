# Task ID: Generated  # Agent Role: Agent (FixingModels)  # Request ID: (Inherited from Overmind)  # Project: task-manager  # Timestamp: 2025-05-24T12:00:00Z

"""
Model definition for task statuses.
"""

from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import List, Optional

from .base import Base  # Import Base from backend/database.py


class TaskStatus(Base):
    """Represents a status that a task can have.

    TaskStatus defines the possible states a task can be in during its lifecycle.
    Example statuses: "To Do", "In Progress", "Done", etc.

    Attributes:
    id: Integer primary key.
    name: The name of the status.
    description: Optional detailed description of what this status means.
    is_default: Boolean flag indicating if this is the default status for new tasks.
    is_completed: Boolean flag indicating if tasks with this status are considered completed.
    created_at: Timestamp when the status was created.
    updated_at: Timestamp when the status was last updated.
    tasks_with_status: List of tasks that have this status.
    """
    __tablename__ = "task_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(
    DateTime,
    default=lambda: datetime.now(timezone.utc),
    onupdate=lambda: datetime.now(timezone.utc),
    nullable=True)  # Relationship to tasks with this status
    tasks_with_status: Mapped[List["Task"]] = relationship(
    "Task",
    primaryjoin="TaskStatus.name == foreign(Task.status)",
    back_populates="status_object"
    )
