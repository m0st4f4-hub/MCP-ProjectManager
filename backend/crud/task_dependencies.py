# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..models import TaskDependency
from ..schemas import TaskDependencyCreate
from fastapi import HTTPException


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
    if task_dependency.predecessor_project_id == task_dependency.successor_project_id and \
       task_dependency.predecessor_task_number == task_dependency.successor_task_number:
        raise HTTPException(status_code=400, detail="A task cannot be dependent on itself")

    # Check for circular dependency
    # This requires traversing the dependency graph from successor to predecessor
    def is_ancestor(current_task_project_id: str, current_task_number: int, target_project_id: str, target_task_number: int) -> bool:
        if current_task_project_id == target_project_id and current_task_number == target_task_number:
            return True

        predecessors = get_task_predecessors(db, successor_project_id=current_task_project_id, successor_task_number=current_task_number)
        for dep in predecessors:
            if is_ancestor(dep.predecessor_project_id, dep.predecessor_task_number, target_project_id, target_task_number):
                return True
        return False

    if is_ancestor(task_dependency.predecessor_project_id, task_dependency.predecessor_task_number, task_dependency.successor_project_id, task_dependency.successor_task_number):
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
