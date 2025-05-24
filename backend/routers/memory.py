from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.services.memory_service import MemoryService
from backend.schemas.memory import MemoryEntity, MemoryEntityCreate, MemoryEntityUpdate, MemoryEntityBase, MemoryObservation, MemoryObservationCreate, MemoryRelation, MemoryRelationCreate # Added direct imports for MemoryRelation and MemoryRelationCreate

# Import auth dependency if needed for protected endpoints
from backend.auth import get_current_active_user # Assuming this exists
from backend.models import User as UserModel # For type hinting current_user
from pydantic import BaseModel, Field # Import BaseModel and Field at the top

router = APIRouter(
    prefix="/memory",
    tags=["Memory / Knowledge Graph"],
    # Optionally add dependencies for authentication for all endpoints here
    # dependencies=[Depends(get_current_active_user)]
)

def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)

# Endpoint for creating a MemoryEntity directly (if needed)
@router.post("/", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
def create_memory_entity_endpoint(
    entity_data: MemoryEntityCreate,
    memory_service: MemoryService = Depends(get_memory_service),
    # current_user: UserModel = Depends(get_current_active_user) # If protected
):
    """Create a new MemoryEntity."""
    return memory_service.create_entity(entity_data)

# Endpoint for getting a MemoryEntity by ID
@router.get("/{entity_id}", response_model=MemoryEntity)
def read_memory_entity_endpoint(
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Retrieve a MemoryEntity by ID."""
    db_entity = memory_service.get_entity(entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Memory entity not found")
    return db_entity

# Endpoint for listing MemoryEntities
@router.get("/", response_model=List[MemoryEntity])
def list_memory_entities_endpoint(
    skip: int = 0,
    limit: int = 100,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Retrieve a list of MemoryEntities."""
    return memory_service.get_entities(skip=skip, limit=limit)

# Endpoint for updating a MemoryEntity
@router.put("/entities/{entity_id}", response_model=MemoryEntity)
def update_entity(entity_id: int, entity_update: MemoryEntityUpdate, db: Session = Depends(get_db)):
    """Update an existing memory entity.

    Args:
        entity_id: The ID of the entity to update.
        entity_update: The data to update the entity with.

    Returns:
        The updated memory entity.

    Raises:
        HTTPException: If the entity is not found.
    """
    db_entity = memory_crud.update_memory_entity(db, entity_id=entity_id, entity_update=entity_update)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return db_entity

# Endpoint for updating a MemoryEntity
@router.put("/{entity_id}", response_model=MemoryEntity)
def update_memory_entity_endpoint(
    entity_update: MemoryEntityUpdate, # Moved to be first
    entity_id: int = Path(..., description="ID of the MemoryEntity"), # Moved and kept default
    memory_service: MemoryService = Depends(get_memory_service),
    # current_user: UserModel = Depends(get_current_active_user) # If protected
):
    """Update a MemoryEntity by ID."""
    db_entity = memory_service.update_entity(entity_id, entity_update)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Memory entity not found")
    return db_entity

# Endpoint for deleting a MemoryEntity
@router.delete("/{entity_id}", response_model=dict)
def delete_memory_entity_endpoint(
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service),
    # current_user: UserModel = Depends(get_current_active_user) # If protected
):
    """Delete a MemoryEntity by ID."""
    success = memory_service.delete_entity(entity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory entity not found")
    return {"message": "Memory entity deleted successfully"}

# Endpoint for file ingestion

class FileIngestInput(BaseModel):
    file_path: str = Field(..., description="Absolute path to the file to ingest.")

@router.post("/ingest/file", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
def ingest_file_endpoint(
    ingest_input: FileIngestInput = Body(..., description="Input data for file ingestion."),
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user) # Protect endpoint
):
    """Ingest a file into the Knowledge Graph.

    Reads the file content and metadata and creates a MemoryEntity.
    Requires authentication.
    """
    try:
        # Delegate ingestion to the service layer
        db_entity = memory_service.ingest_file(file_path=ingest_input.file_path, user_id=current_user.id)
        return db_entity
    except Exception as e:
        # TODO: Handle specific file reading/metadata extraction errors more gracefully
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to ingest file: {e}")

# TODO: Add endpoints for retrieving file content/metadata by MemoryEntity ID.
# TODO: Add endpoints for other ingestion types (e.g., URL, text snippet).

@router.post("/entities/", response_model=MemoryEntity)
def create_entity(entity: MemoryEntityCreate, db: Session = Depends(get_db)):
    """Create a new memory entity.

    Args:
        entity: The data for the new entity.

    Returns:
        The created memory entity.

    Raises:
        HTTPException: If an entity with the same name already exists.
    """
    return memory_crud.create_memory_entity(db=db, entity=entity)

@router.get("/entities/by-type/{entity_type}", response_model=List[MemoryEntity])
def read_entities_by_type(entity_type: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of memory entities filtered by type.

    Args:
        entity_type: The type of entities to filter by.
        skip: The number of items to skip before returning results.
        limit: The maximum number of items to return.

    Returns:
        A list of memory entities.
    """
    return memory_crud.get_memory_entities_by_type(db, entity_type=entity_type, skip=skip, limit=limit)

@router.get("/entities/", response_model=List[MemoryEntity])
def read_entities(type: Optional[str] = None, name: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of memory entities.

    Args:
        type: Optional entity type to filter by.
        name: Optional entity name (partial match) to filter by.
        skip: The number of items to skip before returning results.
        limit: The maximum number of items to return.

    Returns:
        A list of memory entities.
    """
    return memory_crud.get_memory_entities(db, type=type, name=name, skip=skip, limit=limit)

@router.get("/entities/{entity_id}", response_model=MemoryEntity)
def read_entity(entity_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific memory entity by its ID.

    Args:
        entity_id: The ID of the entity to retrieve.

    Returns:
        The memory entity.

    Raises:
        HTTPException: If the entity is not found.
    """
    db_entity = memory_crud.get_memory_entity_by_id(db, entity_id=entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return db_entity

@router.delete("/entities/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity(entity_id: int, db: Session = Depends(get_db)):
    """Delete a memory entity.

    Args:
        entity_id: The ID of the entity to delete.

    Raises:
        HTTPException: If the entity is not found.
    """
    db_entity = memory_crud.delete_memory_entity(db, entity_id=entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    # Return 204 No Content on successful deletion

@router.post("/entities/{entity_id}/observations/", response_model=MemoryObservation)
def add_observation(entity_id: int, observation: MemoryObservationCreate, db: Session = Depends(get_db)):
    """Add an observation to a memory entity.

    Args:
        entity_id: The ID of the entity to add the observation to.
        observation: The data for the new observation.

    Returns:
        The created memory observation.

    Raises:
        HTTPException: If the entity is not found.
    """
    return memory_crud.add_observation_to_entity(db=db, entity_id=entity_id, observation=observation)

@router.get("/observations/", response_model=List[MemoryObservation])
def read_observations(entity_id: Optional[int] = None, search_query: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get observations, optionally filtered by entity or content search.

    Args:
        entity_id: Optional entity ID to filter observations by.
        search_query: Optional text to search within observation content.
        skip: The number of items to skip before returning results.
        limit: The maximum number of items to return.

    Returns:
        A list of memory observations.
    """
    return memory_crud.get_observations(db, entity_id=entity_id, search_query=search_query, skip=skip, limit=limit)

@router.post("/relations/", response_model=MemoryRelation)
def create_relation(relation: MemoryRelationCreate, db: Session = Depends(get_db)):
    """Create a relationship between two memory entities.

    Args:
        relation: The data for the new relation.

    Returns:
        The created memory relation.

    Raises:
        HTTPException: If one or both entities are not found, or if the relation already exists.
    """
    return memory_crud.create_memory_relation(db=db, relation=relation)

@router.get("/relations/by-type/{relation_type}", response_model=List[MemoryRelation])
def read_relations_by_type(relation_type: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of memory relations filtered by type.

    Args:
        relation_type: The type of relations to filter by.
        skip: The number of items to skip before returning results.
        limit: The maximum number of items to return.

    Returns:
        A list of memory relations.
    """
    return memory_crud.get_memory_relations_by_type(db, relation_type=relation_type, skip=skip, limit=limit)

@router.get("/entities/{from_entity_id}/relations/{to_entity_id}", response_model=List[MemoryRelation])
def read_relations_between_entities(from_entity_id: int, to_entity_id: int, relation_type: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get relationships between two specific memory entities, optionally filtered by type.

    Args:
        from_entity_id: The ID of the source entity.
        to_entity_id: The ID of the target entity.
        relation_type: Optional relation type to filter by.
        skip: The number of items to skip before returning results.
        limit: The maximum number of items to return.

    Returns:
        A list of memory relations.
    """
    return memory_crud.get_memory_relations_between_entities(db, from_entity_id=from_entity_id, to_entity_id=to_entity_id, relation_type=relation_type, skip=skip, limit=limit)

@router.get("/entities/{entity_id}/relations/", response_model=List[MemoryRelation])
def get_entity_relations(entity_id: int, relation_type: str | None = None, db: Session = Depends(get_db)):
    """Get relationships for a specific memory entity.

    Args:
        entity_id: The ID of the entity to get relations for.
        relation_type: Optional relation type to filter by.

    Returns:
        A list of memory relations.
    """
    # Check if the entity exists first
    db_entity = memory_crud.get_memory_entity_by_id(db, entity_id=entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")

    return memory_crud.get_relations_for_entity(db, entity_id=entity_id, relation_type=relation_type)

@router.delete("/relations/{relation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relation(relation_id: int, db: Session = Depends(get_db)):
    """Delete a memory relation.

    Args:
        relation_id: The ID of the relation to delete.

    Raises:
        HTTPException: If the relation is not found.
    """
    db_relation = memory_crud.delete_memory_relation(db, relation_id=relation_id)
    if db_relation is None:
        raise HTTPException(status_code=404, detail="Relation not found")
    # Return 204 No Content on successful deletion 