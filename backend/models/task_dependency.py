# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    PrimaryKeyConstraint,
    and_,
    ForeignKeyConstraint
)
from sqlalchemy.orm import relationship
from typing import List, Optional

from .base import Base


class TaskDependency(Base):
    __tablename__ = "task_dependencies"
    __table_args__ = (
        PrimaryKeyConstraint('predecessor_project_id', 'predecessor_task_number', 
                           'successor_project_id', 'successor_task_number'),
        ForeignKeyConstraint(['predecessor_project_id', 'predecessor_task_number'], 
                           ['tasks.project_id', 'tasks.task_number']),
        ForeignKeyConstraint(['successor_project_id', 'successor_task_number'], 
                           ['tasks.project_id', 'tasks.task_number']),
    )

    predecessor_project_id = Column(String(32))
    predecessor_task_number = Column(Integer)
    successor_project_id = Column(String(32))
    successor_task_number = Column(Integer)
    type = Column(String)

    predecessor = relationship(
        "Task",
        primaryjoin="and_(Task.project_id == TaskDependency.predecessor_project_id,"
                   "Task.task_number == TaskDependency.predecessor_task_number)",
        back_populates="dependencies_as_predecessor",
        foreign_keys=[predecessor_project_id, predecessor_task_number]
    )
    successor = relationship(
        "Task",
        primaryjoin="and_(Task.project_id == TaskDependency.successor_project_id,"
                   "Task.task_number == TaskDependency.successor_task_number)",
        back_populates="dependencies_as_successor",
        foreign_keys=[successor_project_id, successor_task_number]
    )
