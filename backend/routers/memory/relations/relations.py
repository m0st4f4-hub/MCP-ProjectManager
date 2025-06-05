from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import MemoryRelation, MemoryRelationCreate

router = APIRouter()


def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)


@router.post("/relations/", response_model=MemoryRelation)
def create_relation(
    relation: MemoryRelationCreate,
    memory_service: MemoryService = Depends(get_memory_service),
):
    return memory_service.create_memory_relation(relation)


@router.get("/relations/by-type/{relation_type}", response_model=List[MemoryRelation])
def read_relations_by_type(
    relation_type: str = Path(..., description="The type of relations to filter by."),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
    memory_service: MemoryService = Depends(get_memory_service),
):
    return memory_service.get_memory_relations_by_type(
        relation_type=relation_type,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/entities/{from_entity_id}/relations/{to_entity_id}",
    response_model=List[MemoryRelation],
)
def read_relations_between_entities(
    from_entity_id: int,
    to_entity_id: int,
    relation_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
    memory_service: MemoryService = Depends(get_memory_service),
):
    return memory_service.get_memory_relations_between_entities(
        from_entity_id=from_entity_id,
        to_entity_id=to_entity_id,
        relation_type=relation_type,
        skip=skip,
        limit=limit,
    )


@router.get("/entities/{entity_id}/relations/", response_model=List[MemoryRelation])
def get_entity_relations(
    entity_id: int,
    relation_type: Optional[str] = Query(None),
    memory_service: MemoryService = Depends(get_memory_service),
):
    return memory_service.get_relations_for_entity(entity_id, relation_type)


@router.put("/relations/{relation_id}", response_model=MemoryRelation)
def update_relation(
    relation: MemoryRelationCreate,
    relation_id: int = Path(..., description="ID of the relation to update."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    updated = memory_service.update_memory_relation(relation_id, relation)
    if updated is None:
        raise HTTPException(
            status_code=404,
            detail=f"MemoryRelation {relation_id} not found",
        )
    return updated


@router.delete("/relations/{relation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relation(
    relation_id: int = Path(..., description="ID of the relation to delete."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    deleted = memory_service.delete_memory_relation(relation_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"MemoryRelation {relation_id} not found",
        )
    return {"message": "Memory relation deleted successfully"}
