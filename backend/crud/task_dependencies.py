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
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
from sqlalchemy import select # Import select for async queries


async def get_task_dependency(db: AsyncSession, predecessor_project_id: str, predecessor_task_number: int, 
 successor_project_id: str, successor_task_number: int) -> Optional[TaskDependency]:
 """Get a specific task dependency."""
 result = await db.execute(select(TaskDependency).filter(
 and_(
 TaskDependency.predecessor_project_id == predecessor_project_id,
 TaskDependency.predecessor_task_number == predecessor_task_number,
 TaskDependency.successor_project_id == successor_project_id,
 TaskDependency.successor_task_number == successor_task_number
 )
 ))
 return result.scalar_one_or_none()


async def get_task_predecessors(db: AsyncSession, successor_project_id: str, successor_task_number: int, 
 skip: int = 0, limit: int = 100) -> List[TaskDependency]:
 """Get all tasks that must complete before this task can start."""
 result = await db.execute(select(TaskDependency).filter(
 and_(
 TaskDependency.successor_project_id == successor_project_id,
 TaskDependency.successor_task_number == successor_task_number
 )
 ).offset(skip).limit(limit))
 return result.scalars().all()


async def get_task_successors(db: AsyncSession, predecessor_project_id: str, predecessor_task_number: int, 
 skip: int = 0, limit: int = 100) -> List[TaskDependency]:
 """Get all tasks that depend on this task."""
 result = await db.execute(select(TaskDependency).filter(
 and_(
 TaskDependency.predecessor_project_id == predecessor_project_id,
 TaskDependency.predecessor_task_number == predecessor_task_number
 )
 ).offset(skip).limit(limit))
 return result.scalars().all()


async def create_task_dependency(db: AsyncSession, task_dependency: TaskDependencyCreate) -> TaskDependency:
 """Create a new task dependency, preventing self or circular dependencies."""
 # Check for self-dependency
 if is_self_dependency(task_dependency.predecessor_project_id, task_dependency.predecessor_task_number,
 task_dependency.successor_project_id, task_dependency.successor_task_number):
 raise HTTPException(status_code=400, detail="A task cannot be dependent on itself")

 # Check for circular dependency
 if await is_circular_dependency(db, task_dependency.predecessor_project_id, task_dependency.predecessor_task_number,
 task_dependency.successor_project_id, task_dependency.successor_task_number):
 raise HTTPException(status_code=400, detail="Circular dependency detected")

 db_task_dependency = TaskDependency(
 predecessor_project_id=task_dependency.predecessor_project_id,
 predecessor_task_number=task_dependency.predecessor_task_number,
 successor_project_id=task_dependency.successor_project_id,
 successor_task_number=task_dependency.successor_task_number,
 dependency_type=task_dependency.dependency_type
 )
 db.add(db_task_dependency)
 await db.commit()
 await db.refresh(db_task_dependency)
 return db_task_dependency


async def delete_task_dependency(db: AsyncSession, predecessor_project_id: str, predecessor_task_number: int,
 successor_project_id: str, successor_task_number: int) -> bool:
 """Remove a task dependency."""
 db_task_dependency = await get_task_dependency(db, predecessor_project_id, predecessor_task_number,
 successor_project_id, successor_task_number)
 if db_task_dependency:
 await db.delete(db_task_dependency)
 await db.commit()
 return True
 return False