from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend import models
# from backend.schemas import (
#     MemoryEntityCreate,
#     MemoryEntityUpdate,
#     MemoryObservationCreate,
#     MemoryRelationCreate,
# )
from backend.schemas.memory import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate,
)
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
import logging
from backend.models.memory import MemoryEntity as MemoryEntityModel # Alias to avoid conflict with schema

logger = logging.getLogger(__name__)


def get_entity_by_name(db: Session, name: str) -> Optional[models.MemoryEntity]:
    """Retrieve a memory entity by its name."""
    return db.query(models.MemoryEntity).filter(models.MemoryEntity.name == name).first()

def create_memory_entity(db: Session, entity: MemoryEntityCreate) -> MemoryEntityModel:
    """Create a new MemoryEntity."""
    db_entity = MemoryEntityModel(
        entity_type=entity.entity_type,
        content=entity.content,
        metadata=entity.metadata,
        source=entity.source,
        source_metadata=entity.source_metadata,
        created_by_user_id=entity.created_by_user_id
        # created_at and updated_at are handled by the model defaults
    )
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return db_entity

def get_memory_entity(db: Session, entity_id: int) -> Optional[MemoryEntityModel]:
    """Retrieve a single MemoryEntity by its ID."""
    return db.query(MemoryEntityModel).filter(MemoryEntityModel.id == entity_id).first()

def get_memory_entities(db: Session, skip: int = 0, limit: int = 100) -> List[MemoryEntityModel]:
    """Retrieve multiple MemoryEntities with pagination."""
    return db.query(MemoryEntityModel).offset(skip).limit(limit).all()

def update_memory_entity(db: Session, entity_id: int, entity_update: MemoryEntityUpdate) -> Optional[MemoryEntityModel]:
    """Update a MemoryEntity by ID."""
    db_entity = get_memory_entity(db, entity_id) # Use the get function within CRUD
    if db_entity:
        update_data = entity_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_entity, key, value)
        db.commit()
        db.refresh(db_entity)
    return db_entity

def delete_memory_entity(db: Session, entity_id: int) -> bool:
    """Delete a MemoryEntity by ID."""
    db_entity = get_memory_entity(db, entity_id) # Use the get function within CRUD
    if db_entity:
        db.delete(db_entity)
        db.commit()
        return True
    return False

# Add more specific retrieval functions if needed (e.g., by type, source, metadata content)
def get_memory_entities_by_source_type(db: Session, source_type: str, skip: int = 0, limit: int = 100) -> List[MemoryEntityModel]:
    """Retrieve MemoryEntities filtered by source type."""
    return db.query(MemoryEntityModel).filter(MemoryEntityModel.source == source_type).offset(skip).limit(limit).all()

# You might also need CRUD for relationships between MemoryEntities if you implement them
# from backend.models.memory import MemoryRelationship as MemoryRelationshipModel # Alias
# from backend.schemas.memory import MemoryRelationshipCreate # Schema

# def create_memory_relationship(db: Session, relationship: MemoryRelationshipCreate) -> MemoryRelationshipModel:
#     db_relationship = MemoryRelationshipModel(
#         source_entity_id=relationship.source_entity_id,
#         target_entity_id=relationship.target_entity_id,
#         relationship_type=relationship.relationship_type
#     )
#     db.add(db_relationship)
#     db.commit()
#     db.refresh(db_relationship)
#     return db_relationship

# def get_memory_relationships_for_entity(db: Session, entity_id: int) -> List[MemoryRelationshipModel]:
#     """Retrieve relationships where the given entity is either source or target."""
#     return db.query(MemoryRelationshipModel).filter(
#         (MemoryRelationshipModel.source_entity_id == entity_id) | (MemoryRelationshipModel.target_entity_id == entity_id)
#     ).all()