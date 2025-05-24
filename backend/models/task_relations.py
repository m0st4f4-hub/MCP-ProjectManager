"""
Task dependency and file association models.
"""

from sqlalchemy import String, Integer, ForeignKey, ForeignKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from .base import Base, BaseModel, generate_uuid_with_hyphens


class TaskDependency(Base, BaseModel):
    """Dependencies between tasks."""
    __tablename__ = "task_dependencies"
    __table_args__ = (
        ForeignKeyConstraint(
            ['predecessor_project_id', 'predecessor_task_number'],
            ['tasks.project_id', 'tasks.task_number']
        ),
        ForeignKeyConstraint(
            ['successor_project_id', 'successor_task_number'],
            ['tasks.project_id', 'tasks.task_number']
        ),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    predecessor_project_id: Mapped[str] = mapped_column(String(32))
    predecessor_task_number: Mapped[int] = mapped_column(Integer)
    successor_project_id: Mapped[str] = mapped_column(String(32))
    successor_task_number: Mapped[int] = mapped_column(Integer)
    dependency_type: Mapped[str] = mapped_column(String, default="finish_to_start")

    predecessor: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[predecessor_project_id, predecessor_task_number],
        back_populates="dependencies_as_predecessor"
    )
    successor: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[successor_project_id, successor_task_number],
        back_populates="dependencies_as_successor"
    )


class TaskFileAssociation(Base, BaseModel):
    """Association between tasks and files."""
    __tablename__ = "task_file_associations"
    __table_args__ = (
        ForeignKeyConstraint(
            ['task_project_id', 'task_task_number'],
            ['tasks.project_id', 'tasks.task_number']
        ),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    task_project_id: Mapped[str] = mapped_column(String(32))
    task_task_number: Mapped[int] = mapped_column(Integer)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    task: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[task_project_id, task_task_number],
        back_populates="task_files"
    )
