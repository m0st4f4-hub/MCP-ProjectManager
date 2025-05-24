# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from backend.models import ProjectFileAssociation
from backend.schemas import ProjectFileAssociationCreate, MemoryEntityCreate, MemoryRelationCreate

# Import the memory crud operations
from . import memory as memory_crud


def get_project_file_association(db: Session, project_id: str, file_memory_entity_name: str) -> Optional[ProjectFileAssociation]:
    """Get a specific project file association."""
    return db.query(ProjectFileAssociation).filter(
        and_(ProjectFileAssociation.project_id == project_id, ProjectFileAssociation.file_memory_entity_name == file_memory_entity_name)
    ).first()


def get_project_files(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[ProjectFileAssociation]:
    """Get all files associated with a project."""
    return db.query(ProjectFileAssociation).filter(
        ProjectFileAssociation.project_id == project_id
    ).offset(skip).limit(limit).all()


def create_project_file_association(db: Session, project_file: ProjectFileAssociationCreate) -> ProjectFileAssociation:
    """Associate a file with a project using file_memory_entity_name."""
    file_memory_entity = memory_crud.get_memory_entity_by_name(db, name=project_file.file_memory_entity_name)
    if not file_memory_entity:
        basic_file_entity_data = MemoryEntityCreate(
            type="file",
            name=project_file.file_memory_entity_name,
            description=f"File reference {project_file.file_memory_entity_name}",
            metadata_={}
        )
        file_memory_entity = memory_crud.create_memory_entity(db=db, entity=basic_file_entity_data)
    project_entity_name = f"project_{project_file.project_id}"
    project_memory_entity = memory_crud.get_memory_entity_by_name(db, name=project_entity_name)
    if not project_memory_entity:
        basic_project_entity_data = MemoryEntityCreate(
            type="project",
            name=project_entity_name,
            description=f"Project with ID {project_file.project_id}",
            metadata_={
                "project_id": project_file.project_id
            }
        )
        project_memory_entity = memory_crud.create_memory_entity(db=db, entity=basic_project_entity_data)
    if file_memory_entity and project_memory_entity:
        relation_data = MemoryRelationCreate(
            from_entity_id=file_memory_entity.id,
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
    db_project_file = ProjectFileAssociation(
        project_id=project_file.project_id,
        file_memory_entity_name=project_file.file_memory_entity_name
    )
    db.add(db_project_file)
    db.commit()
    db.refresh(db_project_file)
    return db_project_file


def delete_project_file_association(db: Session, project_id: str, file_memory_entity_name: str) -> bool:
    """Remove a file association from a project."""
    file_memory_entity = memory_crud.get_memory_entity_by_name(db, name=file_memory_entity_name)
    project_entity_name = f"project_{project_id}"
    project_memory_entity = memory_crud.get_memory_entity_by_name(db, name=project_entity_name)
    if file_memory_entity and project_memory_entity:
        relations_to_delete = memory_crud.get_memory_relations_between_entities(
            db,
            from_entity_id=file_memory_entity.id,
            to_entity_id=project_memory_entity.id,
            relation_type="associated_with"
        )
        for relation in relations_to_delete:
            memory_crud.delete_memory_relation(db, relation_id=relation.id)
    db_project_file = get_project_file_association(db, project_id, file_memory_entity_name)
    if db_project_file:
        db.delete(db_project_file)
        db.commit()
        return True
    return False
