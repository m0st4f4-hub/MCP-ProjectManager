# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..models import TaskFileAssociation
from ..schemas import TaskFileAssociationCreate, MemoryEntityCreate, MemoryRelationCreate

# Import the memory crud operations
from . import memory as memory_crud
# Import file crud (assuming a files crud exists or we'll handle file entity creation here)
# from . import files as files_crud # Need to verify file crud location or implement here


def get_task_file_association(db: Session, task_project_id: str, task_task_number: int, file_memory_entity_name: str) -> Optional[TaskFileAssociation]:
    """Get a specific task file association."""
    return db.query(TaskFileAssociation).filter(
        and_(
            TaskFileAssociation.task_project_id == task_project_id,
            TaskFileAssociation.task_task_number == task_task_number,
            TaskFileAssociation.file_memory_entity_name == file_memory_entity_name
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
    """Associate a file with a task using file_memory_entity_name."""
    # Ensure MemoryEntity for the file exists
    file_memory_entity = memory_crud.get_memory_entity_by_name(db, name=task_file.file_memory_entity_name)
    if not file_memory_entity:
        basic_file_entity_data = MemoryEntityCreate(
            type="file",
            name=task_file.file_memory_entity_name,
            description=f"File reference {task_file.file_memory_entity_name}",
            metadata_={}
        )
        file_memory_entity = memory_crud.create_memory_entity(db=db, entity=basic_file_entity_data)
    # Ensure MemoryEntity for the task exists
    task_entity_name = f"task_{task_file.task_project_id}_{task_file.task_task_number}"
    task_memory_entity = memory_crud.get_memory_entity_by_name(db, name=task_entity_name)
    if not task_memory_entity:
        basic_task_entity_data = MemoryEntityCreate(
            type="task",
            name=task_entity_name,
            description=f"Task {task_file.task_task_number} in project {task_file.task_project_id}",
            metadata_={
                "project_id": task_file.task_project_id,
                "task_number": task_file.task_task_number
            }
        )
        task_memory_entity = memory_crud.create_memory_entity(db=db, entity=basic_task_entity_data)
    # Create a MemoryRelation between the file and task entities
    if file_memory_entity and task_memory_entity:
        relation_data = MemoryRelationCreate(
            from_entity_id=file_memory_entity.id,
            to_entity_id=task_memory_entity.id,
            relation_type="associated_with",
            metadata_={
                "association_type": "task_file"
            }
        )
        existing_relations = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity.id,
            to_entity_id=task_memory_entity.id,
            relation_type="associated_with"
        )
        if not existing_relations:
            memory_crud.create_memory_relation(db=db, relation=relation_data)
    # Create the task file association in the main database
    db_task_file = TaskFileAssociation(
        task_project_id=task_file.task_project_id,
        task_task_number=task_file.task_task_number,
        file_memory_entity_name=task_file.file_memory_entity_name
    )
    db.add(db_task_file)
    db.commit()
    db.refresh(db_task_file)
    return db_task_file


def delete_task_file_association(db: Session, task_project_id: str, task_task_number: int, file_memory_entity_name: str) -> bool:
    """Remove a file association from a task."""
    file_memory_entity = memory_crud.get_memory_entity_by_name(db, name=file_memory_entity_name)
    task_entity_name = f"task_{task_project_id}_{task_task_number}"
    task_memory_entity = memory_crud.get_memory_entity_by_name(db, name=task_entity_name)
    if file_memory_entity and task_memory_entity:
        relations_to_delete = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity.id,
            to_entity_id=task_memory_entity.id,
            relation_type="associated_with"
        )
        for relation in relations_to_delete:
            memory_crud.delete_memory_relation(db, relation_id=relation.id)
    db_task_file = get_task_file_association(db, task_project_id, task_task_number, file_memory_entity_name)
    if db_task_file:
        db.delete(db_task_file)
        db.commit()
        return True
    return False
