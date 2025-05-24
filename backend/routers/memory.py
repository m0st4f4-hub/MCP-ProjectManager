from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud
from .. import schemas
from backend.database import get_db # Corrected import
from ..crud import memory as memory_crud

router = APIRouter(
    prefix="/memory",
    tags=["memory"],
    responses={404: {"description": "Not found"}},
)

@router.post("/entities/", response_model=schemas.MemoryEntity)
def create_entity(entity: schemas.MemoryEntityCreate, db: Session = Depends(get_db)):
    """Create a new memory entity.

    Args:
        entity: The data for the new entity.

    Returns:
        The created memory entity.

    Raises:
        HTTPException: If an entity with the same name already exists.
    """
    return memory_crud.create_memory_entity(db=db, entity=entity)

@router.get("/entities/by-type/{entity_type}", response_model=List[schemas.MemoryEntity])
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

@router.get("/entities/", response_model=List[schemas.MemoryEntity])
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

@router.get("/entities/{entity_id}", response_model=schemas.MemoryEntity)
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

@router.patch("/entities/{entity_id}", response_model=schemas.MemoryEntity)
def update_entity(entity_id: int, entity_update: schemas.MemoryEntityUpdate, db: Session = Depends(get_db)):
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

@router.post("/entities/{entity_id}/observations/", response_model=schemas.MemoryObservation)
def add_observation(entity_id: int, observation: schemas.MemoryObservationCreate, db: Session = Depends(get_db)):
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

@router.get("/observations/", response_model=List[schemas.MemoryObservation])
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

@router.post("/relations/", response_model=schemas.MemoryRelation)
def create_relation(relation: schemas.MemoryRelationCreate, db: Session = Depends(get_db)):
    """Create a relationship between two memory entities.

    Args:
        relation: The data for the new relation.

    Returns:
        The created memory relation.

    Raises:
        HTTPException: If one or both entities are not found, or if the relation already exists.
    """
    return memory_crud.create_memory_relation(db=db, relation=relation)

@router.get("/relations/by-type/{relation_type}", response_model=List[schemas.MemoryRelation])
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

@router.get("/entities/{from_entity_id}/relations/{to_entity_id}", response_model=List[schemas.MemoryRelation])
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

@router.get("/entities/{entity_id}/relations/", response_model=List[schemas.MemoryRelation])
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