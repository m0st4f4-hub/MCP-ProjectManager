# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
CRUD operations for task dependencies.
This file handles database operations for task dependencies.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..models import TaskDependency
# from ..schemas import TaskDependencyCreate # Old import
from backend.schemas.task_dependency import TaskDependencyCreate # Direct import
from fastapi import HTTPException
from .task_dependency_validation import is_circular_dependency
from .utils.dependency_utils import is_self_dependency, get_direct_predecessors


def get_task_dependency(db: Session, predecessor_project_id: str, predecessor_task_number: int, 
                       successor_project_id: str, successor_task_number: int) -> Optional[TaskDependency]:
    """Get a specific task dependency."""
    return db.query(TaskDependency).filter(
        and_(
            TaskDependency.predecessor_project_id == predecessor_project_id,
            TaskDependency.predecessor_task_number == predecessor_task_number,
            TaskDependency.successor_project_id == successor_project_id,
            TaskDependency.successor_task_number == successor_task_number
        )
    ).first()


def get_task_predecessors(db: Session, successor_project_id: str, successor_task_number: int, 
                         skip: int = 0, limit: int = 100) -> List[TaskDependency]:
    """Get all tasks that must complete before this task can start."""
    return db.query(TaskDependency).filter(
        and_(
            TaskDependency.successor_project_id == successor_project_id,
            TaskDependency.successor_task_number == successor_task_number
        )
    ).offset(skip).limit(limit).all()


def get_task_successors(db: Session, predecessor_project_id: str, predecessor_task_number: int, 
                       skip: int = 0, limit: int = 100) -> List[TaskDependency]:
    """Get all tasks that depend on this task."""
    return db.query(TaskDependency).filter(
        and_(
            TaskDependency.predecessor_project_id == predecessor_project_id,
            TaskDependency.predecessor_task_number == predecessor_task_number
        )
    ).offset(skip).limit(limit).all()
def create_task_dependency(db: Session, task_dependency: TaskDependencyCreate) -> TaskDependency:
    """Create a new task dependency, preventing self or circular dependencies."""
    # Check for self-dependency
    if is_self_dependency(task_dependency.predecessor_project_id, task_dependency.predecessor_task_number,
                         task_dependency.successor_project_id, task_dependency.successor_task_number):
        raise HTTPException(status_code=400, detail="A task cannot be dependent on itself")

    # Check for circular dependency
    if is_circular_dependency(db, task_dependency.predecessor_project_id, task_dependency.predecessor_task_number,
                             task_dependency.successor_project_id, task_dependency.successor_task_number):
        raise HTTPException(status_code=400, detail="Circular dependency detected")

    db_task_dependency = TaskDependency(
        predecessor_project_id=task_dependency.predecessor_project_id,
        predecessor_task_number=task_dependency.predecessor_task_number,
        successor_project_id=task_dependency.successor_project_id,
        successor_task_number=task_dependency.successor_task_number,
        type=task_dependency.type
    )
    db.add(db_task_dependency)
    db.commit()
    db.refresh(db_task_dependency)
    return db_task_dependency


def delete_task_dependency(db: Session, predecessor_project_id: str, predecessor_task_number: int,
                          successor_project_id: str, successor_task_number: int) -> bool:
    """Remove a task dependency."""
    db_task_dependency = get_task_dependency(db, predecessor_project_id, predecessor_task_number,
                                           successor_project_id, successor_task_number)
    if db_task_dependency:
        db.delete(db_task_dependency)
        db.commit()
        return True
    return False