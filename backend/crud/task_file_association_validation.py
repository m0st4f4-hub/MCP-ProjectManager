# Task ID: Generated  # Agent Role: Agent (FixingCircularImports)  # Request ID: (Inherited from Overmind)  # Project: task-manager  # Timestamp: 2025-05-24T12:00:00Z

"""
Task file association validation functions.
"""  # from sqlalchemy.orm import Session  # Remove synchronous Session import
from crud import memory as memory_crud
from .utils.task_file_utils import get_task_file_association_direct
from typing import Union
from uuid import UUID  # Import AsyncSession for async operations
from sqlalchemy.ext.asyncio import AsyncSession  # Convert to async function and use AsyncSession


async def file_entity_exists(db: AsyncSession, file_memory_entity_id: int) -> bool:
    """
    Returns True if the file memory entity exists in the memory store.
    """  # Await the async memory_crud call
    return await memory_crud.get_memory_entity(db, entity_id=file_memory_entity_id) is not None  # Convert to async function and use AsyncSession


async def task_entity_exists(db: AsyncSession, task_project_id: Union[str, UUID], task_number: int) -> bool:
    """
    Returns True if the task memory entity exists in the memory store.
    """
    task_entity_name = f"task_{str(task_project_id)}_{task_number}"  # Await the async memory_crud call
    return await memory_crud.get_entity_by_name(db, name=task_entity_name) is not None  # Convert to async function and use AsyncSession


async def association_exists(db: AsyncSession, task_project_id: Union[str, UUID], task_number: int, file_memory_entity_id: int) -> bool:
    """
    Returns True if the task-file association already exists.
    """  # Await the async get_task_file_association_direct call
    return await get_task_file_association_direct(
db,
task_project_id=task_project_id,
task_number=task_number,
file_memory_entity_id=file_memory_entity_id
) is not None  # Convert to async function and use AsyncSession


async def delete_associated_memory_relation(db: AsyncSession, task_project_id: Union[str, UUID], task_number: int, file_memory_entity_id: int) -> None:
    """
    Deletes the associated memory relation between the file and task entities.
    """  # Await the async memory_crud calls
    file_memory_entity = await memory_crud.get_memory_entity(db, entity_id=file_memory_entity_id)
    task_entity_name = f"task_{str(task_project_id)}_{task_number}"
    task_memory_entity = await memory_crud.get_entity_by_name(db, name=task_entity_name)

    if file_memory_entity and task_memory_entity:
        relations_to_delete = await memory_crud.get_memory_relations_between_entities(
        db,
        from_entity_id=file_memory_entity.id,  # Use the ID from the fetched entity
        to_entity_id=task_memory_entity.id,
        relation_type="associated_with"
        )
        for relation in relations_to_delete:  # Await the async memory_crud call
            await memory_crud.delete_memory_relation(db, relation_id=relation.id)
