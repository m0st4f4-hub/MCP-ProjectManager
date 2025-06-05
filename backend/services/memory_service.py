from typing import List, Optional, Dict, Any, Union
import logging
import os
import httpx
import aiofiles

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

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
        return await create_memory_entity(self.db, entity_data)

    async def get_entity(self, entity_id: int) -> Optional[models.MemoryEntity]:
        return await get_memory_entity(self.db, entity_id)

    async def get_memory_entity_by_id(self, entity_id: int) -> Optional[models.MemoryEntity]:
        return await self.get_entity(entity_id)

    async def get_entities(
        self, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryEntity]:
        return await get_memory_entities(self.db, skip, limit)

    async def update_entity(
        self, entity_id: int, entity_update: MemoryEntityUpdate
    ) -> Optional[models.MemoryEntity]:
        return await update_memory_entity(self.db, entity_id, entity_update)

    async def delete_entity(self, entity_id: int) -> bool:
        return await delete_memory_entity(self.db, entity_id)

    async def ingest_file(
        self,
        ingest_input: Union[FileIngestInput, UploadFile, str],
        user_id: Optional[str] = None,
    ) -> models.MemoryEntity:
        file_path = None
        upload: Optional[UploadFile] = None
        if isinstance(ingest_input, UploadFile):
            upload = ingest_input
        elif isinstance(ingest_input, FileIngestInput):
            file_path = ingest_input.file_path
        else:
            file_path = str(ingest_input)

        try:
            if upload is not None:
                filename = upload.filename
                content_bytes = await upload.read()
                extension = os.path.splitext(filename)[1].lower()
                file_info = {
                    "filename": filename,
                    "path": None,
                    "size": len(content_bytes),
                    "modified_time": None,
                    "extension": extension,
                }
                if extension in [
                    ".txt",
                    ".md",
                    ".py",
                    ".js",
                    ".json",
                    ".yml",
                    ".yaml",
                    ".xml",
                    ".csv",
                ]:
                    try:
                        file_content = content_bytes.decode("utf-8")
                    except UnicodeDecodeError:
                        file_content = content_bytes.decode("latin-1")
                else:
                    file_content = f"Binary file: {filename}"
                entity_create = MemoryEntityCreate(
                    entity_type="file",
                    content=file_content,
                    entity_metadata=file_info,
                    source="file_upload",
                    source_metadata={"filename": filename},
                    created_by_user_id=user_id,
                )
                return await self.create_entity(entity_create)
            if file_path is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="file_path is required",
                )
            if not os.path.exists(file_path):
                logger.error(
                    f"File not found during ingestion: {file_path}"
                )
                raise EntityNotFoundError("File", file_path)

            file_stat = os.stat(file_path)
            filename = os.path.basename(file_path)
            file_info = {
                "filename": filename,
                "path": filename,
                "size": file_stat.st_size,
                "modified_time": file_stat.st_mtime,
                "extension": os.path.splitext(file_path)[1].lower(),
            }

            file_content = ""
            if file_info["extension"] in [
                ".txt",
                ".md",
                ".py",
                ".js",
                ".json",
                ".yml",
                ".yaml",
                ".xml",
                ".csv",
            ]:
                try:
                    async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                        file_content = await f.read()
                except UnicodeDecodeError:
                    async with aiofiles.open(file_path, 'r', encoding='latin-1') as f:
                        file_content = await f.read()
            else:
                file_content = f"Binary file: {file_info['filename']}"

            entity_create = MemoryEntityCreate(
                entity_type="file",
                content=file_content,
                entity_metadata=file_info,
                source="file_ingestion",
                source_metadata={"path": filename},
                created_by_user_id=user_id
            )
            return await self.create_entity(entity_create)
        except EntityNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error ingesting file {file_path}: {e}")
            raise ServiceError(f"Error ingesting file: {str(e)}")

    async def ingest_url(
        self, url: str, user_id: Optional[str] = None
    ) -> models.MemoryEntity:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
            response.raise_for_status()
            entity_create = MemoryEntityCreate(
                entity_type="url",
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
        try:
            entity_create = MemoryEntityCreate(
                entity_type="text",
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
        entity = await self.get_entity(entity_id)
        if not entity:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return entity.content or ""

    async def get_file_metadata(self, entity_id: int) -> Dict[str, Any]:
        entity = await self.get_entity(entity_id)
        if not entity:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return entity.entity_metadata or {}

    async def create_memory_entity(self, entity: MemoryEntityCreate) -> models.MemoryEntity:
        try:
            db_entity = models.MemoryEntity(
                type=entity.type,
                name=entity.name,
                description=entity.description,
                metadata_=entity.metadata_
            )
            self.db.add(db_entity)
            await self.db.commit()
            await self.db.refresh(db_entity)
            logger.info(f"Created new memory entity: {db_entity.name} ({db_entity.id})")
            return db_entity
        except IntegrityError:
            await self.db.rollback()
            raise DuplicateEntityError("MemoryEntity", entity.name)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating memory entity: {e}")
            raise ServiceError("Error creating memory entity")

    async def get_memory_entity_by_name(self, name: str) -> Optional[models.MemoryEntity]:
        return (
            await self.db.query(models.MemoryEntity)
            .filter(models.MemoryEntity.name == name)
            .first()
        )

    async def get_knowledge_graph(
        self,
        entity_type: Optional[str] = None,
        relation_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Dict[str, Any]:
        nodes = []
        edges = []

        # Fetch entities based on entity_type and pagination
        entities_query = self.db.query(models.MemoryEntity)
        if entity_type:
            entities_query = entities_query.filter(models.MemoryEntity.type == entity_type)
        all_entities = await entities_query.offset(offset).limit(limit).all()

        # Fetch relations based on relation_type and pagination
        relations_query = self.db.query(models.MemoryRelation)
        if relation_type:
            relations_query = relations_query.filter(models.MemoryRelation.type == relation_type)
        all_relations = await relations_query.offset(offset).limit(limit).all()

        # Map entities to nodes
        for entity in all_entities:
            nodes.append({"id": entity.id, "label": entity.name or str(entity.id), "type": entity.type})

        # Map relations to edges
        for relation in all_relations:
            edges.append({"id": relation.id, "source": relation.from_entity_id, "target": relation.to_entity_id, "label": relation.type})

        return {"nodes": nodes, "edges": edges}

    async def get_memory_entities(
        self,
        type: Optional[str] = None,
        name: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryEntity]:
        query = self.db.query(models.MemoryEntity)
        if type:
            query = query.filter(models.MemoryEntity.type == type)
        if name:
            query = query.filter(models.MemoryEntity.name == name)
        return await query.offset(skip).limit(limit).all()

    async def get_memory_entities_by_type(
        self, entity_type: str, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryEntity]:
        return await self.db.query(models.MemoryEntity).filter(
            models.MemoryEntity.type == entity_type
        ).offset(skip).limit(limit).all()

    async def delete_memory_entity(self, entity_id: int) -> bool:
        db_entity = await self.get_memory_entity_by_id(entity_id)
        if not db_entity:
            return False
        await self.db.delete(db_entity)
        await self.db.commit()
        return True

    async def add_observation_to_entity(
        self, entity_id: int, observation: MemoryObservationCreate
    ) -> models.MemoryObservation:
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
        query = self.db.query(models.MemoryObservation)
        if entity_id:
            query = query.filter(models.MemoryObservation.entity_id == entity_id)
        if search_query:
            query = query.filter(models.MemoryObservation.content.ilike(f'%{search_query}%'))
        return await query.offset(skip).limit(limit).all()

    async def update_observation(
        self, observation_id: int, observation_update: MemoryObservationCreate
    ) -> Optional[models.MemoryObservation]:
        db_observation = await self.db.query(models.MemoryObservation).filter(models.MemoryObservation.id == observation_id).first()
        if not db_observation:
            return None
        for key, value in observation_update.model_dump(exclude_unset=True).items():
            setattr(db_observation, key, value)
        await self.db.commit()
        await self.db.refresh(db_observation)
        logger.info(f"Updated observation {observation_id}")
        return db_observation

    async def delete_observation(self, observation_id: int) -> bool:
        db_observation = await self.db.query(models.MemoryObservation).filter(models.MemoryObservation.id == observation_id).first()
        if not db_observation:
            return False
        await self.db.delete(db_observation)
        await self.db.commit()
        logger.info(f"Deleted observation {observation_id}")
        return True

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
            self.db.add(db_relation)
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
        db_relation = await self.db.query(models.MemoryRelation).filter(models.MemoryRelation.id == relation_id).first()
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
        return await self.db.query(models.MemoryRelation).filter(models.MemoryRelation.id == relation_id).first()

    async def get_relations_for_entity(
        self, entity_id: int, relation_type: Optional[str] = None
    ) -> List[models.MemoryRelation]:
        query = self.db.query(models.MemoryRelation).filter(
            (models.MemoryRelation.from_entity_id == entity_id) |
            (models.MemoryRelation.to_entity_id == entity_id)
        )
        if relation_type:
            query = query.filter(models.MemoryRelation.type == relation_type)
        return await query.all()

    async def delete_memory_relation(
        self, relation_id: int
    ) -> bool:
        db_relation = await self.db.query(models.MemoryRelation).filter(models.MemoryRelation.id == relation_id).first()
        if not db_relation:
            return False
        await self.db.delete(db_relation)
        await self.db.commit()
        logger.info(f"Deleted memory relation {relation_id}")
        return True

    async def get_memory_relations_by_type(
        self, relation_type: str, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryRelation]:
        return await self.db.query(models.MemoryRelation).filter(
            models.MemoryRelation.type == relation_type
        ).offset(skip).limit(limit).all()

    async def get_memory_relations_between_entities(
        self,
        from_entity_id: int,
        to_entity_id: int,
        relation_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryRelation]:
        query = self.db.query(models.MemoryRelation).filter(
            models.MemoryRelation.from_entity_id == from_entity_id,
            models.MemoryRelation.to_entity_id == to_entity_id
        )
        if relation_type:
            query = query.filter(models.MemoryRelation.type == relation_type)
        return await query.offset(skip).limit(limit).all()

    async def search_memory_entities(
        self, query: str, limit: int = 10
    ) -> List[models.MemoryEntity]:
        # Implement search logic here, e.g., using ilike on content or name
        return await self.db.query(models.MemoryEntity).filter(
            (models.MemoryEntity.content.ilike(f'%{query}%')) |
            (models.MemoryEntity.name.ilike(f'%{query}%'))
        ).limit(limit).all()
