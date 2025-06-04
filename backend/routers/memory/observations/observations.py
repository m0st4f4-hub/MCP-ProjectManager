from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from ...database import get_sync_db as get_db
from ...services.memory_service import MemoryService  # Assuming observation management is part of memory service
from ...schemas.memory import MemoryObservation, MemoryObservationCreate
from ...services.exceptions import EntityNotFoundError

router = APIRouter()

def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)

@router.post("/entities/{entity_id}/observations/", response_model=MemoryObservation)


def add_observation(
    entity_id: int = Path(..., description="The ID of the entity to add the observation"
        "to."),
    observation: MemoryObservationCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Add an observation to a memory entity."""
    try:
    db_observation = memory_service.add_observation_to_entity(entity_id=entity_id, observation=observation)
    return db_observation
    except EntityNotFoundError as e:
    raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
    raise HTTPException(
    status_code=500,
    detail=f"Internal server error: {e}"
    )

@router.get("/observations/", response_model=List[MemoryObservation])


def read_observations(
    entity_id: Optional[int] = Query(None, description="Optional entity ID to filter observations by."),
    search_query: Optional[str] = Query(None, description="Optional text to search within observation content."),
    skip: int = Query(0, description="The number of items to skip before returning"
        "results."),
    limit: int = Query(100, description="The maximum number of items to return."),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Get observations, optionally filtered by entity or content search."""
    try:
    return memory_service.get_observations(entity_id=entity_id, search_query=search_query, skip=skip, limit=limit)
    except Exception as e:
    raise HTTPException(
    status_code=500,
    detail=f"Internal server error: {e}"
    )
