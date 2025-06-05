from fastapi import APIRouter, Depends, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService  # Assuming relation management is part of memory service
from ....schemas.memory import MemoryRelation, MemoryRelationCreate
from ....services.exceptions import EntityNotFoundError, DuplicateEntityError
from ....schemas.response import DataResponse

router = APIRouter()

def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)

@router.post("/relations/", response_model=MemoryRelation)


def create_relation(
    relation: MemoryRelationCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Create a relationship between two memory entities."""
    return memory_service.create_memory_relation(relation)

@router.get("/relations/by-type/{relation_type}", response_model=List[MemoryRelation])


def read_relations_by_type(
    relation_type: str = Path(..., description="The type of relations to filter by."),
    skip: int = Query(0, description="The number of items to skip before returning"
        "results."),
    limit: int = Query(100, description="The maximum number of items to return."),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Retrieve a list of memory relations filtered by type."""
    return memory_service.get_memory_relations_by_type(
        relation_type=relation_type, skip=skip, limit=limit
    )
@router.get("/entities/{from_entity_id}/relations/{to_entity_id}", response_model=List[MemoryRelation])


def read_relations_between_entities(
    from_entity_id: int = Path(..., description="ID of the source entity."),
    to_entity_id: int = Path(..., description="ID of the target entity."),
    relation_type: Optional[str] = Query(None, description="Optional relation type to filter by."),
    skip: int = Query(0, description="The number of items to skip before returning"
        "results."),
    limit: int = Query(100, description="The maximum number of items to return."),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Retrieve relations between two specific memory entities."""
    return memory_service.get_memory_relations_between_entities(
        from_entity_id=from_entity_id,
        to_entity_id=to_entity_id,
        relation_type=relation_type,
        skip=skip,
        limit=limit,
    )

@router.get("/entities/{entity_id}/relations/", response_model=List[MemoryRelation])


def get_entity_relations(
    entity_id: int = Path(..., description="ID of the entity to retrieve relations for."),
    relation_type: Optional[str] = Query(None, description="Optional relation type to filter by."),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Get all relations for a specific entity (where it is either the source or target)."""
    return memory_service.get_relations_for_entity(
        entity_id=entity_id, relation_type=relation_type
    )

@router.put("/relations/{relation_id}", response_model=MemoryRelation)


def update_relation(
    relation: MemoryRelationCreate,
    relation_id: int = Path(..., description="ID of the relation to update."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Update an existing memory relation."""
    return memory_service.update_memory_relation(relation_id, relation)

@router.delete("/relations/{relation_id}", response_model=DataResponse[bool])


def delete_relation(
    relation_id: int = Path(..., description="ID of the relation to delete."),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Delete a memory relation."""
    try:
        success = memory_service.delete_memory_relation(relation_id)
        if not success:
            raise EntityNotFoundError("MemoryRelation", relation_id)
        return DataResponse[bool](data=True, message="Memory relation deleted successfully")
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}",
        )
