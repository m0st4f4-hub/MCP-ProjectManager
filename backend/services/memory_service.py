from typing import List, Optional, Dict, Any, Union
import logging
import os
import httpx
import aiofiles

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, select, and_

from .. import models
from ..schemas.memory import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate,
)
from ..schemas.file_ingest import FileIngestInput
from ..crud.memory import (
    create_memory_entity,
    get_memory_entity,
    get_memory_entities,
    update_memory_entity,
    delete_memory_entity,
)
from ..services.exceptions import ServiceError, EntityNotFoundError, DuplicateEntityError

logger = logging.getLogger(__name__)


class MemoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_entity(self, entity_data: MemoryEntityCreate) -> models.MemoryEntity:
        """Create a new memory entity."""
        try:
            db_entity = models.MemoryEntity(
                entity_type=entity_data.entity_type,
                name=entity_data.name,
                content=entity_data.content,
                entity_metadata=entity_data.entity_metadata,
                source=entity_data.source,
                source_metadata=entity_data.source_metadata,
                created_by_user_id=entity_data.created_by_user_id,
            )
            self.db.add(db_entity)
            await self.db.commit()
            await self.db.refresh(db_entity)
            logger.info(f"Created new memory entity: {db_entity.name} ({db_entity.id})")
            return db_entity
        except IntegrityError:
            await self.db.rollback()
            raise DuplicateEntityError("MemoryEntity", entity_data.name)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating memory entity: {e}")
            raise ServiceError("Error creating memory entity")

    async def get_entity(self, entity_id: int) -> Optional[models.MemoryEntity]:
        """Get a memory entity by ID."""
        result = await self.db.execute(select(models.MemoryEntity).where(models.MemoryEntity.id == entity_id))
        return result.scalar_one_or_none()

    async def get_memory_entity_by_id(self, entity_id: int) -> Optional[models.MemoryEntity]:
        """Get a memory entity by ID (alias for get_entity)."""
        return await self.get_entity(entity_id)

    async def get_entities(
        self, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryEntity]:
        """Get all memory entities with pagination."""
        result = await self.db.execute(select(models.MemoryEntity).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def update_entity(
        self, entity_id: int, entity_update: MemoryEntityUpdate
    ) -> Optional[models.MemoryEntity]:
        """Update a memory entity."""
        result = await self.db.execute(select(models.MemoryEntity).where(models.MemoryEntity.id == entity_id))
        db_entity = result.scalar_one_or_none()
        if not db_entity:
            return None

        update_data = entity_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_entity, field, value)

        try:
            await self.db.commit()
            await self.db.refresh(db_entity)
            logger.info(f"Updated memory entity: {entity_id}")
            return db_entity
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating memory entity {entity_id}: {e}")
            raise ServiceError("Error updating memory entity")

    async def delete_entity(self, entity_id: int) -> bool:
        """Delete a memory entity."""
        result = await self.db.execute(select(models.MemoryEntity).where(models.MemoryEntity.id == entity_id))
        db_entity = result.scalar_one_or_none()
        if not db_entity:
            return False
        await self.db.delete(db_entity)
        await self.db.commit()
        return True

    async def ingest_file(
        self,
        ingest_input: Union[FileIngestInput, UploadFile, str],
        user_id: Optional[str] = None,
    ) -> models.MemoryEntity:
        """Ingest a file into memory."""
        try:
            if isinstance(ingest_input, str):
                # File path
                file_path = ingest_input
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                entity_create = MemoryEntityCreate(
                    entity_type="file",
                    name=file_path.split("/")[-1],
                    content=content,
                    entity_metadata={"file_path": file_path},
                    source="file_ingestion",
                    source_metadata={"file_path": file_path},
                    created_by_user_id=user_id,
                )
            elif isinstance(ingest_input, UploadFile):
                # UploadFile
                content = await ingest_input.read()
                try:
                    text_content = content.decode("utf-8")
                except UnicodeDecodeError:
                    try:
                        text_content = content.decode("latin-1")
                    except Exception:
                        text_content = f"Binary file: {ingest_input.filename}"

                entity_create = MemoryEntityCreate(
                    entity_type="file",
                    name=ingest_input.filename or "uploaded_file",
                    content=text_content,
                    entity_metadata={
                        "filename": ingest_input.filename,
                        "content_type": ingest_input.content_type,
                        "size": len(content),
                    },
                    source="file_upload",
                    source_metadata=None,
                    created_by_user_id=user_id,
                )
            else:
                # FileIngestInput
                entity_create = MemoryEntityCreate(
                    entity_type="file",
                    name=ingest_input.name,
                    content=ingest_input.content,
                    entity_metadata=ingest_input.metadata,
                    source="file_ingestion",
                    source_metadata=ingest_input.source_metadata,
                    created_by_user_id=user_id,
                )

            return await self.create_entity(entity_create)
        except EntityNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error ingesting file: {e}")
            raise ServiceError(f"Error ingesting file: {str(e)}")

    def ingest_uploaded_file(
        self,
        filename: str,
        content: bytes,
        content_type: str,
        user_id: Optional[str] = None,
    ) -> models.MemoryEntity:
        """Create a MemoryEntity from an uploaded file."""
        try:
            try:
                text_content = content.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    text_content = content.decode("latin-1")
                except Exception:
                    text_content = f"Binary file: {filename}"

            file_info = {
                "filename": filename,
                "size": len(content),
                "content_type": content_type,
            }

            entity_create = MemoryEntityCreate(
                entity_type="file",
                name=filename,
                content=text_content,
                entity_metadata=file_info,
                source="file_upload",
                source_metadata=None,
                created_by_user_id=user_id,
            )
            return self.create_entity(entity_create)
        except Exception as e:
            logger.error(f"Error ingesting uploaded file {filename}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ingesting uploaded file: {str(e)}",
            )

    async def ingest_url(
        self, url: str, user_id: Optional[str] = None
    ) -> models.MemoryEntity:
        """Ingest content from a URL."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
            response.raise_for_status()
            entity_create = MemoryEntityCreate(
                entity_type="url",
                name=url,
                content=response.text,
                entity_metadata={"url": url, "status_code": response.status_code},
                source="url_ingestion",
                source_metadata={"url": url},
                created_by_user_id=user_id
            )
            return await self.create_entity(entity_create)
        except Exception as e:
            logger.error(f"Error ingesting url {url}: {e}")
            raise ServiceError(f"Error ingesting url: {str(e)}")

    async def ingest_text(
        self,
        text: str,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> models.MemoryEntity:
        """Ingest text content."""
        try:
            entity_create = MemoryEntityCreate(
                entity_type="text",
                name="text_content",
                content=text,
                entity_metadata=metadata,
                source="text_ingestion",
                source_metadata=None,
                created_by_user_id=user_id
            )
            return await self.create_entity(entity_create)
        except Exception as e:
            logger.error(f"Error ingesting text: {e}")
            raise ServiceError(f"Error ingesting text: {str(e)}")

    async def get_file_content(self, entity_id: int) -> str:
        """Get file content by entity ID."""
        entity = await self.get_entity(entity_id)
        if not entity:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return entity.content or ""

    async def get_file_metadata(self, entity_id: int) -> Dict[str, Any]:
        """Get file metadata by entity ID."""
        entity = await self.get_entity(entity_id)
        if not entity:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return entity.entity_metadata or {}

    async def get_memory_entity_by_name(self, name: str) -> Optional[models.MemoryEntity]:
        """Get memory entity by name."""
        result = await self.db.execute(select(models.MemoryEntity).where(models.MemoryEntity.name == name))
        return result.scalar_one_or_none()

    async def get_knowledge_graph(
        self,
        entity_type: Optional[str] = None,
        relation_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Dict[str, List[Any]]:
        """Retrieve entities and relations with optional filters."""
        entity_query = select(models.MemoryEntity)
        if entity_type:
            entity_query = entity_query.where(models.MemoryEntity.entity_type == entity_type)
        entity_query = entity_query.offset(offset).limit(limit)
        entity_result = await self.db.execute(entity_query)
        entities = list(entity_result.scalars().all())

        relation_query = select(models.MemoryRelation)
        if relation_type:
            relation_query = relation_query.where(models.MemoryRelation.relation_type == relation_type)
        relation_query = relation_query.offset(offset).limit(limit)
        relation_result = await self.db.execute(relation_query)
        relations = list(relation_result.scalars().all())

        return {"entities": entities, "relations": relations}

    async def get_memory_entities(
        self,
        entity_type: Optional[str] = None,
        name: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryEntity]:
        """Get memory entities with filters."""
        query = select(models.MemoryEntity)
        conditions = []
        if entity_type:
            conditions.append(models.MemoryEntity.entity_type == entity_type)
        if name:
            conditions.append(models.MemoryEntity.name == name)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_memory_entities_by_type(
        self, entity_type: str, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryEntity]:
        """Get memory entities by type."""
        query = select(models.MemoryEntity).where(models.MemoryEntity.entity_type == entity_type).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def delete_memory_entity(self, entity_id: int) -> bool:
        """Delete memory entity by ID."""
        db_entity = await self.get_memory_entity_by_id(entity_id)
        if not db_entity:
            return False
        await self.db.delete(db_entity)
        await self.db.commit()
        return True

    async def add_observation_to_entity(
        self, entity_id: int, observation: MemoryObservationCreate
    ) -> models.MemoryObservation:
        """Add observation to entity."""
        try:
            db_observation = models.MemoryObservation(
                entity_id=entity_id,
                content=observation.content,
                metadata_=observation.metadata_,
                created_by_user_id=observation.created_by_user_id
            )
            self.db.add(db_observation)
            await self.db.commit()
            await self.db.refresh(db_observation)
            logger.info(f"Added observation {db_observation.id} to entity {entity_id}")
            return db_observation
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error adding observation to entity {entity_id}: {e}")
            raise ServiceError("Error adding observation to entity")

    async def get_observations(
        self,
        entity_id: Optional[int] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryObservation]:
        """Get observations with filters."""
        query = select(models.MemoryObservation)
        conditions = []
        if entity_id:
            conditions.append(models.MemoryObservation.entity_id == entity_id)
        if search_query:
            conditions.append(models.MemoryObservation.content.ilike(f'%{search_query}%'))
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_observation(
        self, observation_id: int, observation_update: MemoryObservationCreate
    ) -> Optional[models.MemoryObservation]:
        """Update observation."""
        result = await self.db.execute(select(models.MemoryObservation).where(models.MemoryObservation.id == observation_id))
        db_observation = result.scalar_one_or_none()
        if not db_observation:
            return None

        update_data = observation_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_observation, field, value)

        try:
            await self.db.commit()
            await self.db.refresh(db_observation)
            logger.info(f"Updated memory observation: {observation_id}")
            return db_observation
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating memory observation {observation_id}: {e}")
            raise ServiceError("Error updating memory observation")

    async def delete_observation(self, observation_id: int) -> bool:
        result = await self.db.execute(select(models.MemoryObservation).where(models.MemoryObservation.id == observation_id))
        db_observation = result.scalar_one_or_none()
        if not db_observation:
            return False
        try:
            await self.db.delete(db_observation)
            await self.db.commit()
            logger.info(f"Deleted memory observation: {observation_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting memory observation {observation_id}: {e}")
            raise ServiceError("Error deleting memory observation")

    async def create_memory_relation(
        self, relation: MemoryRelationCreate
    ) -> models.MemoryRelation:
        try:
            db_relation = models.MemoryRelation(
                from_entity_id=relation.from_entity_id,
                to_entity_id=relation.to_entity_id,
                type=relation.type,
                metadata_=relation.metadata_,
                created_by_user_id=relation.created_by_user_id
            )
            await self.db.add(db_relation)
            await self.db.commit()
            await self.db.refresh(db_relation)
            logger.info(f"Created new memory relation: {db_relation.from_entity_id}-{db_relation.to_entity_id}-{db_relation.type}")
            return db_relation
        except IntegrityError:
            await self.db.rollback()
            raise DuplicateEntityError("MemoryRelation", f"{relation.from_entity_id}-{relation.to_entity_id}-{relation.type}")
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating memory relation: {e}")
            raise ServiceError("Error creating memory relation")

    async def update_memory_relation(
        self, relation_id: int, relation_update: MemoryRelationCreate
    ) -> models.MemoryRelation:
        result = await self.db.execute(select(models.MemoryRelation).where(models.MemoryRelation.id == relation_id))
        db_relation = result.scalar_one_or_none()
        if not db_relation:
            raise EntityNotFoundError("MemoryRelation", relation_id)

        for key, value in relation_update.model_dump(exclude_unset=True).items():
            setattr(db_relation, key, value)

        try:
            await self.db.commit()
            await self.db.refresh(db_relation)
            logger.info(f"Updated memory relation {relation_id}")
            return db_relation
        except IntegrityError:
            await self.db.rollback()
            raise DuplicateEntityError("MemoryRelation", f"{relation_update.from_entity_id}-{relation_update.to_entity_id}-{relation_update.type}")
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating memory relation {relation_id}: {e}")
            raise ServiceError("Error updating memory relation")

    async def get_memory_relation(
        self, relation_id: int
    ) -> Optional[models.MemoryRelation]:
        result = await self.db.execute(select(models.MemoryRelation).where(models.MemoryRelation.id == relation_id))
        return result.scalar_one_or_none()

    async def get_relations_for_entity(
        self,
        entity_id: int,
        relation_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryRelation]:
        query = select(models.MemoryRelation).where(
            or_(
                models.MemoryRelation.from_entity_id == entity_id,
                models.MemoryRelation.to_entity_id == entity_id
            )
        )
        if relation_type:
            query = query.where(models.MemoryRelation.relation_type == relation_type)
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def delete_memory_relation(
        self, relation_id: int
    ) -> bool:
        result = await self.db.execute(select(models.MemoryRelation).where(models.MemoryRelation.id == relation_id))
        db_relation = result.scalar_one_or_none()
        if not db_relation:
            return False
        await self.db.delete(db_relation)
        await self.db.commit()
        logger.info(f"Deleted memory relation {relation_id}")
        return True

    async def get_memory_relations_by_type(
        self, relation_type: str, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryRelation]:
        query = select(models.MemoryRelation).where(models.MemoryRelation.relation_type == relation_type).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_memory_relations_between_entities(
        self,
        from_entity_id: int,
        to_entity_id: int,
        relation_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryRelation]:
        query = select(models.MemoryRelation).where(
            and_(
                models.MemoryRelation.from_entity_id == from_entity_id,
                models.MemoryRelation.to_entity_id == to_entity_id
            )
        )
        if relation_type:
            query = query.where(models.MemoryRelation.relation_type == relation_type)
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def search(
        self, query: str, limit: int = 10
    ) -> List[models.MemoryEntity]:
        search_query = select(models.MemoryEntity).where(
            or_(
                models.MemoryEntity.content.ilike(f'%{query}%'),
                models.MemoryEntity.name.ilike(f'%{query}%')
            )
        ).limit(limit)
        result = await self.db.execute(search_query)
        return list(result.scalars().all())

    async def get_knowledge_graph(self) -> Dict[str, List[models.BaseModel]]:
        """Return all memory entities and relations."""
        entities_result = await self.db.execute(select(models.MemoryEntity))
        entities = list(entities_result.scalars().all())
        
        relations_result = await self.db.execute(select(models.MemoryRelation))
        relations = list(relations_result.scalars().all())
        
        return {"entities": entities, "relations": relations}
