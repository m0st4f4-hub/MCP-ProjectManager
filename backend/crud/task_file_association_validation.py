# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Task file association validation functions.
"""

from sqlalchemy.orm import Session
from backend.crud import memory as memory_crud
from .utils.task_file_utils import get_task_file_association_direct
from typing import Union
from uuid import UUID


def file_entity_exists(db: Session, file_memory_entity_id: int) -> bool:
    """
    Returns True if the file memory entity exists in the memory store.
    """
    return memory_crud.get_memory_entity_by_id(db, entity_id=file_memory_entity_id) is not None


def task_entity_exists(db: Session, task_project_id: Union[str, UUID], task_number: int) -> bool:
    """
    Returns True if the task memory entity exists in the memory store.
    """
    task_entity_name = f"task_{str(task_project_id)}_{task_number}"
    return memory_crud.get_memory_entity_by_name(db, name=task_entity_name) is not None


def association_exists(db: Session, task_project_id: Union[str, UUID], task_number: int, file_memory_entity_id: int) -> bool:
    """
    Returns True if the task-file association already exists.
    """
    return get_task_file_association_direct(
        db, 
        task_project_id=task_project_id, 
        task_number=task_number, 
        file_memory_entity_id=file_memory_entity_id
    ) is not None


def delete_associated_memory_relation(db: Session, task_project_id: Union[str, UUID], task_number: int, file_memory_entity_id: int) -> None:
    """
    Deletes the associated memory relation between the file and task entities.
    """
    file_memory_entity = memory_crud.get_memory_entity_by_id(db, entity_id=file_memory_entity_id)
    task_entity_name = f"task_{str(task_project_id)}_{task_number}"
    task_memory_entity = memory_crud.get_memory_entity_by_name(db, name=task_entity_name)

    if file_memory_entity and task_memory_entity:
        relations_to_delete = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity.id,  # Use the ID from the fetched entity
            to_entity_id=task_memory_entity.id,
            relation_type="associated_with"
        )
        for relation in relations_to_delete:
            memory_crud.delete_memory_relation(db, relation_id=relation.id)
