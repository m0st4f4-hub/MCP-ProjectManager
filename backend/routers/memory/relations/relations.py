from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import MemoryRelation, MemoryRelationCreate
from ....services.exceptions import EntityNotFoundError

router = APIRouter()


def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)


@router.post("/relations/", response_model=MemoryRelation)
def create_relation(
    relation: MemoryRelationCreate,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Create a relationship between two memory entities."""
    try:
        return memory_service.create_memory_relation(relation)
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover - fallback error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.put("/relations/{relation_id}", response_model=MemoryRelation)
def update_relation(
    relation: MemoryRelationCreate,
    relation_id: int = Path(..., description="ID of the relation to update."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Update a memory relation."""
    try:
        return memory_service.update_memory_relation(relation_id, relation)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover - fallback error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/relations/by-type/{relation_type}", response_model=List[MemoryRelation])
def read_relations_by_type(
    relation_type: str = Path(..., description="The type of relations to filter by."),
    skip: int = Query(0, description="The number of items to skip before returning results."),
    limit: int = Query(100, description="The maximum number of items to return."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Retrieve memory relations filtered by type."""
    try:
        return memory_service.get_memory_relations_by_type(relation_type, skip=skip, limit=limit)
    except Exception as e:  # pragma: no cover - fallback error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/entities/{from_entity_id}/relations/{to_entity_id}", response_model=List[MemoryRelation])
def read_relations_between_entities(
    from_entity_id: int = Path(..., description="ID of the source entity."),
    to_entity_id: int = Path(..., description="ID of the target entity."),
    relation_type: Optional[str] = Query(None, description="Optional relation type to filter by."),
    skip: int = Query(0, description="The number of items to skip before returning results."),
    limit: int = Query(100, description="The maximum number of items to return."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Retrieve relations between two specific memory entities."""
    try:
        return memory_service.get_memory_relations_between_entities(
            from_entity_id=from_entity_id,
            to_entity_id=to_entity_id,
            relation_type=relation_type,
            skip=skip,
            limit=limit,
        )
    except Exception as e:  # pragma: no cover - fallback error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/entities/{entity_id}/relations/", response_model=List[MemoryRelation])
def get_entity_relations(
    entity_id: int = Path(..., description="ID of the entity to retrieve relations for."),
    relation_type: Optional[str] = Query(None, description="Optional relation type to filter by."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Get all relations for a specific entity."""
    try:
        return memory_service.get_relations_for_entity(entity_id, relation_type=relation_type)
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover - fallback error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.delete("/relations/{relation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relation(
    relation_id: int = Path(..., description="ID of the relation to delete."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Delete a memory relation."""
    try:
        deleted = memory_service.delete_memory_relation(relation_id)
        if not deleted:
            raise EntityNotFoundError("MemoryRelation", relation_id)
        return {"message": "Memory relation deleted successfully"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # pragma: no cover - fallback error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
