# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Task file association utility functions to avoid circular imports.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Union, Optional
from uuid import UUID
from ...models import TaskFileAssociation


def get_task_file_association_direct(
    db: Session,
    task_project_id: Union[str, UUID],
    task_number: int,
    file_memory_entity_id: int
) -> Optional[TaskFileAssociation]:
    """
    Get a specific task-file association by task composite ID and file memory entity ID.
    This is a direct database query to avoid circular imports.
    """
    return db.query(TaskFileAssociation).filter(
        and_(
            TaskFileAssociation.task_project_id == str(task_project_id),
            TaskFileAssociation.task_task_number == task_number,
            TaskFileAssociation.file_memory_entity_id == file_memory_entity_id
        )
    ).first()
