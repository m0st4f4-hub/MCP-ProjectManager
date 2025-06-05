# Task ID: 211  
# Agent Role: DebuggingSpecialist  
# Request ID: (Inherited from Overmind)  
# Project: project-manager  
# Timestamp: 2025-05-09T20:45:00Z

from ..schemas.memory import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate,
    MemoryRelationUpdate,
)
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
import logging
from ..models.memory import MemoryEntity as MemoryEntityModel
from sqlalchemy import (
    text,
    select,
    update,
    delete,
    and_  # Import and_ for relationships
)
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession
from ..models.memory import MemoryRelation as MemoryRelationshipModel

logger = logging.getLogger(__name__)


async def get_entity_by_name(db: AsyncSession, name: str) -> Optional[MemoryEntityModel]:
    """Retrieve a memory entity by its name, searching within entity_metadata."""
    logger.debug(f"[DEBUG] get_entity_by_name called with name: {name}")
    # Use json_extract for SQLite compatibility
    result = await db.execute(text("SELECT memory_entities.* FROM memory_entities "
        "WHERE json_extract(memory_entities.entity_metadata, '$.name') = :name").params(name=name))
    entity = result.scalar_one_or_none()
    logger.debug(f"[DEBUG] get_entity_by_name returned: {entity}")
    return entity

async def create_memory_entity(db: AsyncSession, entity: MemoryEntityCreate) -> MemoryEntityModel:
    """Create a new MemoryEntity."""
    logger.debug(f"[DEBUG] create_memory_entity called with entity: {entity.model_dump_json()}")  # Debug print
    db_entity = MemoryEntityModel(
    entity_type=entity.entity_type,
    content=entity.content,
    entity_metadata=entity.entity_metadata,
    source=entity.source,
    source_metadata=entity.source_metadata,
    created_by_user_id=entity.created_by_user_id  # created_at and updated_at are handled by the model defaults
    )
    db.add(db_entity)
    await db.commit()
    await db.refresh(db_entity)
    logger.debug(f"[DEBUG] create_memory_entity returned: {db_entity}")  # Debug print
    return db_entity

async def get_memory_entity(db: AsyncSession, entity_id: int) -> Optional[MemoryEntityModel]:
    """Retrieve a single MemoryEntity by its ID."""
    logger.debug(f"[DEBUG] get_memory_entity called with entity_id: {entity_id}")  # Debug print
    result = await db.execute(select(MemoryEntityModel).filter(MemoryEntityModel.id == entity_id))
    entity = result.scalar_one_or_none()
    logger.debug(f"[DEBUG] get_memory_entity returned: {entity}")  # Debug print
    return entity

async def get_memory_entities(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[MemoryEntityModel]:
    """Retrieve multiple MemoryEntities with pagination."""
    logger.debug(f"[DEBUG] get_memory_entities called with skip: {skip}, limit: {limit}")  # Debug print
    result = await db.execute(select(MemoryEntityModel).offset(skip).limit(limit))
    entities = result.scalars().all()
    logger.debug(f"[DEBUG] get_memory_entities returned {len(entities)} entities")  # Debug print
    return entities

async def update_memory_entity(db: AsyncSession, entity_id: int, entity_update: MemoryEntityUpdate) -> Optional[MemoryEntityModel]:
    """Update a MemoryEntity by ID."""
    logger.debug(f"[DEBUG] update_memory_entity called with entity_id: {entity_id}, update_data: {entity_update.model_dump_json()}")  # Debug print  # Fetch the entity asynchronously
    db_entity = await get_memory_entity(db, entity_id)
    if db_entity:
        update_data = entity_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_entity, key, value)
            await db.commit()
            await db.refresh(db_entity)
            logger.debug(f"[DEBUG] update_memory_entity returned updated entity: {db_entity}")  # Debug print
        else:
            logger.debug(f"[DEBUG] update_memory_entity did not find entity with id {entity_id}")  # Debug print
            return db_entity

async def delete_memory_entity(db: AsyncSession, entity_id: int) -> bool:
            """Delete a MemoryEntity by ID."""
            logger.debug(f"[DEBUG] delete_memory_entity called with entity_id: {entity_id}")  # Debug print  # Fetch the entity asynchronously
            db_entity = await get_memory_entity(db, entity_id)
            if db_entity:
                await db.delete(db_entity)  # Await delete
                await db.commit()  # Await commit
                logger.debug(f"[DEBUG] delete_memory_entity successfully deleted entity with id {entity_id}")  # Debug print
                return True
            logger.debug(f"[DEBUG] delete_memory_entity did not find entity with id {entity_id}")  # Debug print
            return False  # Add more specific retrieval functions if needed (e.g., by type, source, metadata content)
async def get_memory_entities_by_source_type(db: AsyncSession, source_type: str, skip: int = 0, limit: int = 100) -> List[MemoryEntityModel]:
            """Retrieve MemoryEntities filtered by source type."""
            logger.debug(f"[DEBUG] get_memory_entities_by_source_type called with source_type: {source_type}")  # Debug print
            result = await db.execute(select(MemoryEntityModel).filter(MemoryEntityModel.source == source_type).offset(skip).limit(limit))
            entities = result.scalars().all()
            logger.debug(f"[DEBUG] get_memory_entities_by_source_type returned {len(entities)} entities")  # Debug print
            return entities

async def get_memory_relations_between_entities(db: AsyncSession, from_entity_id: int, to_entity_id: int, relation_type: str):
            """Retrieve relationships between two entities."""  # This function was implicitly used, converting to async and adding debug
            logger.debug(f"[DEBUG] get_memory_relations_between_entities called with from: {from_entity_id}, to: {to_entity_id}, type: {relation_type}")  # Debug print  # from backend.models.memory import MemoryRelationship as MemoryRelationshipModel  # Import inside function to avoid circular dep if needed - REMOVED
            result = await db.execute(
            select(MemoryRelationshipModel).filter(
            and_(
            MemoryRelationshipModel.from_entity_id == from_entity_id,
            MemoryRelationshipModel.to_entity_id == to_entity_id,
            MemoryRelationshipModel.relation_type == relation_type
            )
            )
            )
            relations = result.scalars().all()
            logger.debug(f"[DEBUG] get_memory_relations_between_entities returned {len(relations)} relations")  # Debug print
            return relations

async def create_memory_relation(db: AsyncSession, relation: MemoryRelationCreate):
            """Create a memory relationship."""  # This function was implicitly used, converting to async and adding debug
            logger.debug(f"[DEBUG] create_memory_relation called with relation: {relation.model_dump_json()}")  # Debug print  # from backend.models.memory import MemoryRelationship as MemoryRelationshipModel  # Import inside function - REMOVED
            db_relationship = MemoryRelationshipModel(
            from_entity_id=relation.from_entity_id,
            to_entity_id=relation.to_entity_id,
            relation_type=relation.relation_type
            )
            db.add(db_relationship)
            await db.commit()
            await db.refresh(db_relationship)
            logger.debug(f"[DEBUG] create_memory_relation returned: {db_relationship}")  # Debug print
            return db_relationship


async def update_memory_relation(
    db: AsyncSession, relation_id: int, relation_update: MemoryRelationUpdate
) -> Optional[MemoryRelationshipModel]:
    """Update a memory relation by ID."""
    logger.debug(
        f"[DEBUG] update_memory_relation called with relation_id: {relation_id}, update_data: {relation_update.model_dump_json()}"
    )
    result = await db.execute(
        select(MemoryRelationshipModel).where(MemoryRelationshipModel.id == relation_id)
    )
    db_relation = result.scalar_one_or_none()
    if db_relation:
        update_data = relation_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_relation, key, value)
        await db.commit()
        await db.refresh(db_relation)
        logger.debug(
            f"[DEBUG] update_memory_relation returned updated relation: {db_relation}"
        )
        return db_relation
    logger.debug(
        f"[DEBUG] update_memory_relation did not find relation with id {relation_id}"
    )
    return None

async def delete_memory_relation(db: AsyncSession, relation_id: int):
            """Delete a memory relationship by ID."""  # This function was implicitly used, converting to async and adding debug
            logger.debug(f"[DEBUG] delete_memory_relation called with relation_id: {relation_id}")  # Debug print  # from backend.models.memory import MemoryRelationship as MemoryRelationshipModel  # Import inside function - REMOVED
            stmt = delete(MemoryRelationshipModel).where(MemoryRelationshipModel.id == relation_id)
            result = await db.execute(stmt)  # No commit needed here if caller handles it, but adding for completeness
            await db.commit()
            logger.debug(f"[DEBUG] delete_memory_relation result: {result.rowcount} rows affected")  # Debug print
            return result.rowcount > 0
