from typing import List, Optional, Dict, Any
import logging
import os
import httpx

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .. import models
from ..schemas.memory import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate
)
from ..schemas.file_ingest import FileIngestInput
from ..crud.memory import (
    create_memory_entity,
    get_memory_entity,
    get_memory_entities,
    update_memory_entity,
    delete_memory_entity,
)
from ..services.exceptions import EntityNotFoundError

logger = logging.getLogger(__name__)


class MemoryService:
    def __init__(self, db: Session):
        self.db = db

    def create_entity(self, entity_data: MemoryEntityCreate) -> models.MemoryEntity:
        return create_memory_entity(self.db, entity_data)

    def get_entity(self, entity_id: int) -> Optional[models.MemoryEntity]:
        return get_memory_entity(self.db, entity_id)

    def get_memory_entity_by_id(self, entity_id: int) -> Optional[models.MemoryEntity]:
        return self.get_entity(entity_id)

    def get_entities(
        self, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryEntity]:
        return get_memory_entities(self.db, skip, limit)

    def update_entity(
        self, entity_id: int, entity_update: MemoryEntityUpdate
    ) -> Optional[models.MemoryEntity]:
        return update_memory_entity(self.db, entity_id, entity_update)

    def delete_entity(self, entity_id: int) -> bool:
        return delete_memory_entity(self.db, entity_id)

    def ingest_file(
        self, ingest_input: FileIngestInput, user_id: Optional[str] = None
    ) -> models.MemoryEntity:
        file_path = ingest_input.file_path
        try:
            if not os.path.exists(file_path):
                logger.error(
                    f"File not found during ingestion: {file_path}"
                )
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"File not found: {file_path}",
                )

            file_stat = os.stat(file_path)
            file_info = {
                "filename": os.path.basename(file_path),
                "path": file_path,
                "size": file_stat.st_size,
                "modified_time": file_stat.st_mtime,
                "extension": os.path.splitext(file_path)[1].lower()
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
                    with open(file_path, 'r', encoding='utf-8') as f:
                        file_content = f.read()
                except UnicodeDecodeError:
                    with open(file_path, 'r', encoding='latin-1') as f:
                        file_content = f.read()
            else:
                file_content = f"Binary file: {file_info['filename']}"

            entity_create = MemoryEntityCreate(
                entity_type="file",
                content=file_content,
                entity_metadata=file_info,
                source="file_ingestion",
                source_metadata={"path": file_path},
                created_by_user_id=user_id
            )
            return self.create_entity(entity_create)
        except Exception as e:
            logger.error(f"Error ingesting file {file_path}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ingesting file: {str(e)}",
            )

    def ingest_url(
        self, url: str, user_id: Optional[str] = None
    ) -> models.MemoryEntity:
        try:
            response = httpx.get(url)
            response.raise_for_status()
            entity_create = MemoryEntityCreate(
                entity_type="url",
                content=response.text,
                entity_metadata={"url": url, "status_code": response.status_code},
                source="url_ingestion",
                source_metadata={"url": url},
                created_by_user_id=user_id
            )
            return self.create_entity(entity_create)
        except Exception as e:
            logger.error(f"Error ingesting url {url}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ingesting url: {str(e)}",
            )

    def ingest_text(
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
            return self.create_entity(entity_create)
        except Exception as e:
            logger.error(f"Error ingesting text: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ingesting text: {str(e)}",
            )

    def get_file_content(self, entity_id: int) -> str:
        entity = self.get_entity(entity_id)
        if not entity:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return entity.content or ""

    def get_file_metadata(self, entity_id: int) -> Dict[str, Any]:
        entity = self.get_entity(entity_id)
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entity not found",
            )
        return entity.entity_metadata or {}

    def create_memory_entity(self, entity: MemoryEntityCreate) -> models.MemoryEntity:
        try:
            db_entity = models.MemoryEntity(
                type=entity.type,
                name=entity.name,
                description=entity.description,
                metadata_=entity.metadata_
            )
            self.db.add(db_entity)
            self.db.commit()
            self.db.refresh(db_entity)
            logger.info(f"Created new memory entity: {db_entity.name} ({db_entity.id})")
            return db_entity
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Entity with name '{entity.name}' already exists",
            )
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating memory entity: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating memory entity",
            )

    def get_memory_entity_by_name(self, name: str) -> Optional[models.MemoryEntity]:
        return (
            self.db.query(models.MemoryEntity)
            .filter(models.MemoryEntity.name == name)
            .first()
        )

    def get_memory_entities(
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
            query = query.filter(models.MemoryEntity.name.ilike(f"%{name}%"))
        return query.offset(skip).limit(limit).all()

    def get_memory_entities_by_type(
        self, entity_type: str, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryEntity]:
        return (
            self.db.query(models.MemoryEntity)
            .filter(models.MemoryEntity.type == entity_type)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def delete_memory_entity(self, entity_id: int) -> Optional[models.MemoryEntity]:
        db_entity = self.get_entity(entity_id)
        if db_entity:
            self.db.delete(db_entity)
            self.db.commit()
            logger.info(f"Deleted memory entity: {entity_id}")
            return db_entity

    def add_observation_to_entity(
        self, entity_id: int, observation: MemoryObservationCreate
    ) -> models.MemoryObservation:
        db_entity = self.get_memory_entity_by_id(entity_id)
        if db_entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entity not found",
            )

        db_observation = models.MemoryObservation(
            entity_id=entity_id,
            content=observation.content,
            source=observation.source,
            metadata_=observation.metadata_,
            timestamp=observation.timestamp
        )
        self.db.add(db_observation)
        self.db.commit()
        self.db.refresh(db_observation)
        logger.info(f"Added observation to entity {entity_id}: {db_observation.id}")
        return db_observation

    def get_observations(
        self,
        entity_id: Optional[int] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[models.MemoryObservation]:
        query = self.db.query(models.MemoryObservation)
        if entity_id is not None:
            query = query.filter(models.MemoryObservation.entity_id == entity_id)
        if search_query:
            query = query.filter(
                models.MemoryObservation.content.ilike(f"%{search_query}%")
            )
        return query.offset(skip).limit(limit).all()

    def create_memory_relation(
        self, relation: MemoryRelationCreate
    ) -> models.MemoryRelation:
        from_entity = self.get_memory_entity_by_id(relation.from_entity_id)
        to_entity = self.get_memory_entity_by_id(relation.to_entity_id)
        if not from_entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Source entity with ID {relation.from_entity_id} not found"
                ),
            )
        if not to_entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Target entity with ID {relation.to_entity_id} not found"
                ),
            )

        try:
            db_relation = models.MemoryRelation(
                from_entity_id=relation.from_entity_id,
                to_entity_id=relation.to_entity_id,
                relation_type=relation.relation_type,
                metadata_=relation.metadata_
            )
            self.db.add(db_relation)
            self.db.commit()
            self.db.refresh(db_relation)
            logger.info(f"Created new memory relation: {db_relation.id}")
            return db_relation
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Relation of type '{relation.relation_type}' already exists "
                    f"between entity {relation.from_entity_id} "
                    f"and entity {relation.to_entity_id}"
                ),
            )
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating memory relation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating memory relation",
            )

    def get_memory_relation(
        self, relation_id: int
    ) -> Optional[models.MemoryRelation]:
        return (
            self.db.query(models.MemoryRelation)
            .filter(models.MemoryRelation.id == relation_id)
            .first()
        )

    def get_relations_for_entity(
        self, entity_id: int, relation_type: Optional[str] = None
    ) -> List[models.MemoryRelation]:
        query = self.db.query(models.MemoryRelation).filter(
            (models.MemoryRelation.from_entity_id == entity_id) |
            (models.MemoryRelation.to_entity_id == entity_id)
        )
        if relation_type:
            query = query.filter(models.MemoryRelation.relation_type == relation_type)
        return query.all()

    def delete_memory_relation(
        self, relation_id: int
    ) -> Optional[models.MemoryRelation]:
        db_relation = self.get_memory_relation(relation_id)
        if db_relation:
            self.db.delete(db_relation)
            self.db.commit()
            logger.info(f"Deleted memory relation: {relation_id}")
        return db_relation

    def get_memory_relations_by_type(
        self, relation_type: str, skip: int = 0, limit: int = 100
    ) -> List[models.MemoryRelation]:
        return (
            self.db.query(models.MemoryRelation)
            .filter(models.MemoryRelation.relation_type == relation_type)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_memory_relations_between_entities(
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
            query = query.filter(models.MemoryRelation.relation_type == relation_type)
        return query.offset(skip).limit(limit).all()

    def search_memory_entities(
        self, query: str, limit: int = 10
    ) -> List[models.MemoryEntity]:
        return self.get_memory_entities(name=query, limit=limit)
