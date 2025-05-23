from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from backend import models
from typing import List, Optional, Dict, Any
import logging
import json # Needed for json.dumps

# Import specific schema classes from their files
from backend.schemas.memory import MemoryEntityCreate, MemoryEntityUpdate, MemoryObservationCreate, MemoryRelationCreate # Import from the specific file

# Assuming a schema for MemoryEntityCreate exists
from backend.crud.memory import ( # Assuming memory CRUD exists
    create_memory_entity,
    get_memory_entity,
    get_memory_entities,
    update_memory_entity,
    delete_memory_entity,
    get_memory_entities_by_source_type # Assuming this exists for filtering
)

# Assuming Desktop Commander tools can be accessed or wrapped
# from mcp_desktop_commander import read_file, get_file_info # Conceptual import

logger = logging.getLogger(__name__)

class MemoryService:
    """Service for managing memory entities, observations, and relations."""

    def __init__(self, db: Session):
        self.db = db

    def create_entity(self, entity_data: MemoryEntityCreate) -> models.MemoryEntity:
        """Create a new MemoryEntity."""
        return create_memory_entity(self.db, entity_data)

    def get_entity(self, entity_id: int) -> Optional[models.MemoryEntity]:
        """Retrieve a MemoryEntity by ID."""
        return get_memory_entity(self.db, entity_id)

    def get_entities(self, skip: int = 0, limit: int = 100) -> List[models.MemoryEntity]:
        """Retrieve multiple MemoryEntities."""
        return get_memory_entities(self.db, skip, limit)

    def update_entity(self, entity_id: int, entity_update: MemoryEntityUpdate) -> Optional[models.MemoryEntity]:
        """Update a MemoryEntity."""
        return update_memory_entity(self.db, entity_id, entity_update)

    def delete_entity(self, entity_id: int) -> bool:
        """Delete a MemoryEntity."""
        return delete_memory_entity(self.db, entity_id)

    def ingest_file(self, file_path: str, user_id: Optional[str] = None) -> models.MemoryEntity:
        """Ingest a file into the Knowledge Graph as a MemoryEntity.

        Reads file content and metadata, creates a MemoryEntity.
        """
        # TODO: Implement actual file reading and metadata extraction using Desktop Commander tools.
        # This might require a separate service/agent interaction depending on framework.
        # For now, simulate or add placeholder.

        file_content = "Placeholder file content." # Replace with tool call
        file_info = {"filename": file_path.split('/')[-1], "path": file_path, "size": len(file_content)} # Replace with tool call

        # Create a MemoryEntityCreate schema instance
        entity_create = MemoryEntityCreate(
            entity_type="file",
            content=file_content,
            entity_metadata=file_info,
            source="file_ingestion",
            source_metadata={"path": file_path},
            created_by_user_id=user_id
        )

        # Use the CRUD function to create the entity
        return self.create_entity(entity_create)

    # Add other ingestion methods as needed (e.g., from URLs, text snippets)

    def create_memory_entity(self, entity: MemoryEntityCreate) -> models.MemoryEntity:
        """Creates a new memory entity."""
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
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Entity with name '{entity.name}' already exists")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating memory entity: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating memory entity")

    def get_memory_entity_by_name(self, name: str) -> Optional[models.MemoryEntity]:
        """Gets a memory entity by its unique name."""
        return self.db.query(models.MemoryEntity).filter(models.MemoryEntity.name == name).first()

    def get_memory_entities(self, type: Optional[str] = None, name: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.MemoryEntity]:
        """Gets a list of memory entities, optionally filtered by type or name."""
        query = self.db.query(models.MemoryEntity)
        if type:
            query = query.filter(models.MemoryEntity.type == type)
        if name:
            query = query.filter(models.MemoryEntity.name.like(f"%{name}%"))
        return query.offset(skip).limit(limit).all()

    def get_memory_entities_by_type(self, entity_type: str, skip: int = 0, limit: int = 100) -> List[models.MemoryEntity]:
        """Gets a list of memory entities filtered by type."""
        return self.db.query(models.MemoryEntity).filter(models.MemoryEntity.type == entity_type).offset(skip).limit(limit).all()

    def delete_memory_entity(self, entity_id: int) -> Optional[models.MemoryEntity]:
        """Deletes a memory entity and its associated observations and relations."""
        db_entity = self.get_memory_entity_by_id(db_entity)
        if db_entity:
            self.db.delete(db_entity)
            self.db.commit()
            logger.info(f"Deleted memory entity: {entity_id}")
        return db_entity

    def add_observation_to_entity(self, entity_id: int, observation: MemoryObservationCreate) -> models.MemoryObservation:
        """Adds an observation to a memory entity."""
        db_entity = self.get_memory_entity_by_id(entity_id)
        if db_entity is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")

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

    def get_observations(self, entity_id: Optional[int] = None, search_query: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.MemoryObservation]:
        """Gets observations, optionally filtered by entity or content search."""
        query = self.db.query(models.MemoryObservation)
        if entity_id is not None:
            query = query.filter(models.MemoryObservation.entity_id == entity_id)
        if search_query:
            query = query.filter(models.MemoryObservation.content.like(f"%{search_query}%"))
        return query.offset(skip).limit(limit).all()

    def create_memory_relation(self, relation: MemoryRelationCreate) -> models.MemoryRelation:
        """Creates a new relationship between two entities."""
        from_entity = self.get_memory_entity_by_id(entity_id=relation.from_entity_id)
        to_entity = self.get_memory_entity_by_id(entity_id=relation.to_entity_id)
        if not from_entity:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Source entity with ID {relation.from_entity_id} not found")
        if not to_entity:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Target entity with ID {relation.to_entity_id} not found")

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
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Relation of type '{relation.relation_type}' already exists between entity {relation.from_entity_id} and entity {relation.to_entity_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating memory relation: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating memory relation")

    def get_memory_relation(self, relation_id: int) -> Optional[models.MemoryRelation]:
        """Gets a memory relation by its ID."""
        return self.db.query(models.MemoryRelation).filter(models.MemoryRelation.id == relation_id).first()

    def get_relations_for_entity(self, entity_id: int, relation_type: str | None = None) -> List[models.MemoryRelation]:
        """Gets relationships for a specific entity."""
        query = self.db.query(models.MemoryRelation).filter(
            (models.MemoryRelation.from_entity_id == entity_id) |
            (models.MemoryRelation.to_entity_id == entity_id)
        )
        if relation_type:
            query = query.filter(models.MemoryRelation.relation_type == relation_type)
        return query.all()

    def delete_memory_relation(self, relation_id: int) -> Optional[models.MemoryRelation]:
        """Deletes a memory relation."""
        db_relation = self.get_memory_relation(relation_id)
        if db_relation:
            self.db.delete(db_relation)
            self.db.commit()
            logger.info(f"Deleted memory relation: {relation_id}")
        return db_relation

    def get_memory_relations_by_type(self, relation_type: str, skip: int = 0, limit: int = 100) -> List[models.MemoryRelation]:
        """Gets a list of memory relations filtered by type."""
        return self.db.query(models.MemoryRelation).filter(models.MemoryRelation.relation_type == relation_type).offset(skip).limit(limit).all()

    def get_memory_relations_between_entities(self, from_entity_id: int, to_entity_id: int, relation_type: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.MemoryRelation]:
        """Gets relationships between two specific entities, optionally filtered by type."""
        query = self.db.query(models.MemoryRelation).filter(
            models.MemoryRelation.from_entity_id == from_entity_id,
            models.MemoryRelation.to_entity_id == to_entity_id
        )
        if relation_type:
            query = query.filter(models.MemoryRelation.relation_type == relation_type)
        return query.offset(skip).limit(limit).all()

    def search_memory_entities(self, query: str, limit: int = 10) -> List[models.MemoryEntity]:
        """Searches memory entities by name."""
        # This method is needed for the mcp router. Represents a simple search functionality.
        return self.get_memory_entities(name=query, limit=limit) 