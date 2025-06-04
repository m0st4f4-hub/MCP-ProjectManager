# Task ID: Generated  # Agent Role: Agent (FixingCircularImports)  # Request ID: (Inherited from Overmind)  # Project: task-manager  # Timestamp: 2025-05-24T12:00:00Z

"""
Task file association utility functions to avoid circular imports.
"""  # from sqlalchemy.orm import Session  # Remove synchronous Session import
from sqlalchemy import and_
from typing import Union, Optional
from uuid import UUID
from ...models import TaskFileAssociation  # Import AsyncSession and select for async queries
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select  # Convert to async function and use AsyncSession


async def get_task_file_association_direct(
    db: AsyncSession,
    task_project_id: Union[str, UUID],
    task_number: int,
    file_memory_entity_id: int
) -> Optional[TaskFileAssociation]:
    """
    Get a specific task-file association by task composite ID and file memory entity ID.
    This is a direct database query to avoid circular imports.
    """  # Use async syntax
    result = await db.execute(
    select(TaskFileAssociation).where(
    and_(
    TaskFileAssociation.task_project_id == str(task_project_id),
    TaskFileAssociation.task_task_number == task_number,
    TaskFileAssociation.file_memory_entity_id == file_memory_entity_id
    )
    )
    )
    return result.scalar_one_or_none()
