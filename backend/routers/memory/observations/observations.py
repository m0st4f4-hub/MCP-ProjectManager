from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import MemoryObservation, MemoryObservationCreate
from ....schemas.api_responses import PaginationParams
from ....services.exceptions import EntityNotFoundError
from ....schemas.api_responses import DataResponse

router = APIRouter()

def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)

@router.post("/entities/{entity_id}/observations/", response_model=MemoryObservation)
def add_observation(
    observation: MemoryObservationCreate,
    entity_id: int = Path(..., description="The ID of the entity to add the observation to."),
    memory_service: MemoryService = Depends(get_memory_service)
): 
    """Add an observation to a memory entity."""
    try:
        db_observation = memory_service.add_observation_to_entity(
            entity_id=entity_id, observation=observation
        )
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
    entity_id: Optional[int] = Query(
        None, description="Optional entity ID to filter observations by."
    ),
    search_query: Optional[str] = Query(
        None, description="Optional text to search within observation content."
    ),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, gt=0, description="Max records to return"),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Get observations, optionally filtered by entity or content search."""
    try:
        return memory_service.get_observations(
            entity_id=entity_id,
            search_query=search_query,
            skip=skip,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.put("/observations/{observation_id}", response_model=MemoryObservation)
def update_observation_endpoint(
    observation: MemoryObservationCreate,
    observation_id: int = Path(..., description="ID of the observation to update."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Update a memory observation."""
    try:
        db_observation = memory_service.update_observation(observation_id, observation)
        if not db_observation:
            raise EntityNotFoundError("MemoryObservation", observation_id)
        return db_observation
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.delete("/observations/{observation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_observation_endpoint(
    observation_id: int = Path(..., description="ID of the observation to delete."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Delete a memory observation."""
    try:
        success = memory_service.delete_observation(observation_id)
        if not success:
            raise EntityNotFoundError("MemoryObservation", observation_id)
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
