# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Union
from ..models import TaskFileAssociation
# from ..schemas import TaskFileAssociationCreate, MemoryEntityCreate, MemoryRelationCreate # Removed package import
from backend.schemas.file_association import TaskFileAssociationCreate
from backend.schemas.memory import MemoryEntityCreate, MemoryRelationCreate
import uuid

# Import the memory crud operations
from . import memory as memory_crud
# Import file crud (assuming a files crud exists or we'll handle file entity creation here)
# from . import files as files_crud # Need to verify file crud location or implement here

# Import validation helpers
from .task_file_association_validation import task_entity_exists, association_exists, delete_associated_memory_relation


def get_files_for_task(db: Session, task_project_id: Union[str, uuid.UUID], task_number: int) -> List[TaskFileAssociation]:
    """Get all file associations for a task."""
    return db.query(TaskFileAssociation).filter(
        and_(
            TaskFileAssociation.task_project_id == str(task_project_id),
            TaskFileAssociation.task_task_number == task_number
        )
    ).all()


def get_task_file_association(
    db: Session,
    task_project_id: Union[str, uuid.UUID],
    task_number: int,
    file_memory_entity_id: int
) -> Optional[TaskFileAssociation]:
    """Get a specific task-file association by task composite ID and file memory entity ID."""
    return db.query(TaskFileAssociation).filter(
        and_(
            TaskFileAssociation.task_project_id == str(task_project_id),
            TaskFileAssociation.task_task_number == task_number,
            TaskFileAssociation.file_memory_entity_id == file_memory_entity_id
        )
    ).first()


def get_task_files(db: Session, task_project_id: str, task_task_number: int, skip: int = 0, limit: int = 100) -> List[TaskFileAssociation]:
    """Get all files associated with a task."""
    return db.query(TaskFileAssociation).filter(
        and_(
            TaskFileAssociation.task_project_id == task_project_id,
            TaskFileAssociation.task_task_number == task_task_number
        )
    ).offset(skip).limit(limit).all()


def create_task_file_association(db: Session, task_file: TaskFileAssociationCreate) -> TaskFileAssociation:
    """Associate a file with a task using the file_memory_entity_id from the schema."""

    # Use validation helpers
    if association_exists(db, task_file.task_project_id, task_file.task_task_number, task_file.file_memory_entity_id):
        # If association exists, return the existing one
        return get_task_file_association(db, task_file.task_project_id, task_file.task_task_number, task_file.file_memory_entity_id)

    # Task entity validation (assuming task entity creation happens elsewhere or is not strictly required here)
    # file entity existence check should ideally happen before calling this CRUD function

    db_task_file = TaskFileAssociation(
        task_project_id=task_file.task_project_id,
        task_task_number=task_file.task_task_number,
        file_memory_entity_id=task_file.file_memory_entity_id
    )
    db.add(db_task_file)
    db.commit()
    db.refresh(db_task_file)
    return db_task_file


def delete_task_file_association(db: Session, task_project_id: str, task_task_number: int, file_memory_entity_id: int) -> bool:
    """Remove a task file association by task composite ID and file memory entity ID."""

    # Use validation helper to delete associated memory relation
    delete_associated_memory_relation(db, task_project_id, task_task_number, file_memory_entity_id)

    # Get and delete the task file association in the main database
    db_task_file = get_task_file_association(
        db, task_project_id=task_project_id, task_number=task_task_number, file_memory_entity_id=file_memory_entity_id)

    if db_task_file:
        db.delete(db_task_file)
        db.commit()
        return True
    return False


def associate_file_with_task(
    db: Session,
    task_project_id: Union[str, uuid.UUID],
    task_number: int,
    file_memory_entity_id: int
) -> TaskFileAssociation:
    """Associate a file with a task using file_memory_entity_id."""
    # This function should now primarily prepare the schema and call the CRUD create function.
    # Validation for file and task entity existence should ideally happen before this service call.

    task_file = TaskFileAssociationCreate(
        task_project_id=str(task_project_id),
        task_task_number=task_number,
        file_memory_entity_id=file_memory_entity_id
    )
    return create_task_file_association(db, task_file)


def disassociate_file_from_task(
    db: Session,
    task_project_id: Union[str, uuid.UUID],
    task_number: int,
    file_memory_entity_id: int
) -> bool:
    """Remove a file association from a task by task details and file memory entity ID."""
    # Use the updated delete_task_file_association in CRUD
    return delete_task_file_association(
        db, task_project_id=task_project_id, task_task_number=task_number, file_memory_entity_id=file_memory_entity_id)
