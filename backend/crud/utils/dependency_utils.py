# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Utility functions for working with task dependencies.
This file contains common functionality without circular imports.
"""

from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ...models import TaskDependency
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


def is_self_dependency(predecessor_project_id: str, predecessor_task_number: int,
                      successor_project_id: str, successor_task_number: int) -> bool:
    """
    Returns True if the predecessor and successor refer to the same task (self-dependency).
    """
    return predecessor_project_id == successor_project_id and predecessor_task_number == successor_task_number


async def get_direct_predecessors(db: AsyncSession, successor_project_id: str, successor_task_number: int) -> list[TaskDependency]:
    """
    Get all tasks that must complete before this task can start.
    This is a utility function used by validation logic.
    """
    result = await db.execute(select(TaskDependency).filter(
        and_(
            TaskDependency.successor_project_id == successor_project_id,
            TaskDependency.successor_task_number == successor_task_number
        )
    ))
    return result.scalars().all()
