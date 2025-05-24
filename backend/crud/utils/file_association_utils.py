# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Utility functions for working with project file associations.
This file contains common functionality without circular imports.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from ...models import ProjectFileAssociation
from ... import crud
from typing import Union
from uuid import UUID

from backend import crud as backend_crud
from backend.crud import memory as memory_crud # Alias for clarity


def get_association(db: Session, project_id: str, file_memory_entity_id: int):
    """
    Utility function to get a project file association.
    This avoids circular imports by being in a separate module.
    """
    return db.query(ProjectFileAssociation).filter(
        and_(
            ProjectFileAssociation.project_id == project_id, 
            ProjectFileAssociation.file_memory_entity_id == file_memory_entity_id
        )
    ).first()


def file_entity_exists(db: Session, file_memory_entity_id: int) -> bool:
    """
    Returns True if the file memory entity exists in the memory store.
    """
    return memory_crud.get_memory_entity(db, entity_id=file_memory_entity_id) is not None


def project_entity_exists(db: Session, project_id: str) -> bool:
    """
    Returns True if the project memory entity exists in the memory store.
    """
    project_entity_name = f"project_{project_id}"
    return backend_crud.memory.get_memory_entity_by_name(db, name=project_entity_name) is not None


def association_exists(db: Session, project_id: str, file_memory_entity_id: int) -> bool:
    """
    Returns True if the project-file association already exists.
    """
    return get_association(db, project_id, file_memory_entity_id) is not None
