# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

"""
CRUD operations for project file associations.
This file handles database operations for task dependencies.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..models import ProjectFileAssociation
# from ..schemas import ProjectFileAssociationCreate, MemoryEntityCreate, MemoryRelationCreate # Removed package import
# from backend.schemas.project_file_association import ProjectFileAssociationCreate # Incorrect import
from backend.schemas.project import ProjectFileAssociationCreate # Correct import location
from backend.schemas.memory import MemoryEntityCreate, MemoryRelationCreate

# Import the memory crud operations
from . import memory as memory_crud
from .utils.file_association_utils import file_entity_exists, project_entity_exists, association_exists
from .utils.file_association_utils import get_association


def get_project_file_association(db: Session, project_id: str, file_memory_entity_id: int) -> Optional[ProjectFileAssociation]:
    """Get a specific project file association by project ID and file memory entity ID."""
    return get_association(db, project_id, file_memory_entity_id)


def get_project_files(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[ProjectFileAssociation]:
    """Get all files associated with a project."""
    return db.query(ProjectFileAssociation).filter(
        ProjectFileAssociation.project_id == project_id
    ).offset(skip).limit(limit).all()


def create_project_file_association(db: Session, project_file: ProjectFileAssociationCreate) -> ProjectFileAssociation:
    """Associate a file with a project using file_memory_entity_id."""
    # Validation using helpers
    if not file_entity_exists(db, project_file.file_memory_entity_id):
        raise ValueError(f"MemoryEntity with ID {project_file.file_memory_entity_id} not found.")
    # Project entity creation logic remains as is (auto-create if missing)
    # Association existence check (optional, could raise or skip creation)
    if association_exists(db, project_file.project_id, project_file.file_memory_entity_id):
        return get_project_file_association(db, project_file.project_id, project_file.file_memory_entity_id)
    # Fetch MemoryEntity for the file using the provided ID
    file_memory_entity = memory_crud.get_memory_entity_by_id(db, entity_id=project_file.file_memory_entity_id)
    if not file_memory_entity:
        # The associated MemoryEntity must exist.
        raise ValueError(f"MemoryEntity with ID {project_file.file_memory_entity_id} not found.")

    # Handle the project MemoryEntity and relation creation as before.
    project_entity_name = f"project_{project_file.project_id}"
    project_memory_entity = memory_crud.get_memory_entity_by_name(db, name=project_entity_name)
    if not project_memory_entity:
        # This part can remain as it creates a project entity if it doesn't exist.
        basic_project_entity_data = MemoryEntityCreate(
            type="project",
            name=project_entity_name,
            description=f"Project with ID {project_file.project_id}",
            metadata_={
                "project_id": project_file.project_id
            }
        )
        project_memory_entity = memory_crud.create_memory_entity(db=db, entity=basic_project_entity_data)

    # Create MemoryRelation if both entities exist
    if file_memory_entity and project_memory_entity:
        relation_data = MemoryRelationCreate(
            from_entity_id=file_memory_entity.id, # Use the fetched file_memory_entity's ID
            to_entity_id=project_memory_entity.id,
            relation_type="associated_with",
            metadata_={
                 "association_type": "project_file"
            }
        )
        existing_relations = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity.id,
            to_entity_id=project_memory_entity.id,
            relation_type="associated_with"
        )
        if not existing_relations:
            memory_crud.create_memory_relation(db=db, relation=relation_data)

    # Create the ProjectFileAssociation in the main database
    db_project_file = ProjectFileAssociation(
        project_id=project_file.project_id,
        # Use the file_memory_entity_id from the input schema
        file_memory_entity_id=project_file.file_memory_entity_id
    )
    db.add(db_project_file)
    db.commit()
    db.refresh(db_project_file)
    return db_project_file

def delete_project_file_association(db: Session, project_id: str, file_memory_entity_id: int) -> bool:
    """Remove a file association from a project by project ID and file memory entity ID."""
    # Find the file memory entity by ID
    file_memory_entity = memory_crud.get_memory_entity_by_id(db, entity_id=file_memory_entity_id)
    # Allow deleting the association even if the memory entity is not found (database might be out of sync)

    project_entity_name = f"project_{project_id}"
    project_memory_entity = memory_crud.get_memory_entity_by_name(db, name=project_entity_name)
    
    # Delete the MemoryRelation between the file and project entities, if both are found
    if file_memory_entity and project_memory_entity:
        relations_to_delete = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity_id, # Use the ID
            to_entity_id=project_memory_entity.id,
            relation_type="associated_with"
        )
        for relation in relations_to_delete:
            memory_crud.delete_memory_relation(db, relation_id=relation.id)

    # Get and delete the project file association in the main database
    # Use the updated get_project_file_association that takes ID
    db_project_file = get_project_file_association(
        db, project_id=project_id, file_memory_entity_id=file_memory_entity_id)
    if db_project_file:
        db.delete(db_project_file)
        db.commit()
        return True
    return False


def associate_file_with_project(db: Session, project_id: str, file_memory_entity_id: int) -> ProjectFileAssociation:
    """Associate a file with a project using file_memory_entity_id."""
    # Ensure MemoryEntity for the file exists.
    # The creation logic is removed from here, as per previous decision.
    file_memory_entity = memory_crud.get_memory_entity_by_id(db, entity_id=file_memory_entity_id)
    if not file_memory_entity:
        raise ValueError(f"MemoryEntity with ID {file_memory_entity_id} not found.")

    # Create the schema using the provided file_memory_entity_id
    project_file = ProjectFileAssociationCreate(
        project_id=project_id,
        file_memory_entity_id=file_memory_entity_id # Use file_memory_entity_id
    )
    return create_project_file_association(db, project_file)

def get_files_for_project(db: Session, project_id: str) -> List[ProjectFileAssociation]:
    """Get all file associations for a project."""
    # This function already uses project_id and seems correct based on the model.
    return db.query(ProjectFileAssociation).filter(
        ProjectFileAssociation.project_id == project_id
    ).all()


def disassociate_file_from_project(
    db: Session,
    project_id: str,
    file_memory_entity_id: int # This function signature expects the integer ID
) -> bool:
    """Remove a file association from a project by project ID and file memory entity ID."""
    # This function signature already takes the correct ID. The previous code
    # attempted to get the association using name, which was incorrect.
    # The logic here now correctly uses the provided file_memory_entity_id.

    # Find the file memory entity by ID to get its name for memory relation deletion
    file_memory_entity = memory_crud.get_memory_entity_by_id(db, entity_id=file_memory_entity_id)
    if not file_memory_entity:
        # If the memory entity doesn't exist, the association shouldn't either (or was already removed)
        return False

    project_entity_name = f"project_{project_id}"
    project_memory_entity = memory_crud.get_memory_entity_by_name(db, name=project_entity_name)

    # Delete the MemoryRelation between the file and project entities
    if file_memory_entity and project_memory_entity:
        relations_to_delete = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity_id, # Use the ID
            to_entity_id=project_memory_entity.id,
            relation_type="associated_with"
        )
        for relation in relations_to_delete:
            memory_crud.delete_memory_relation(db, relation_id=relation.id)

    # Get and delete the project file association in the main database
    # Use the updated get_project_file_association that takes ID
    db_project_file = get_project_file_association(
        db, project_id=project_id, file_memory_entity_id=file_memory_entity_id)
    if db_project_file:
        db.delete(db_project_file)
        db.commit()
        return True
    return False