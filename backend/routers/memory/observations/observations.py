<<<<<<< HEAD
<<<<<<< HEAD
from fastapi import APIRouter, Depends, Query, Path, status, HTTPException
=======
=======
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
<<<<<<< HEAD
from fastapi import APIRouter, Depends, Query, Path, status
=======
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
<<<<<<< HEAD
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
=======
=======
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import MemoryObservation, MemoryObservationCreate
from ....schemas.api_responses import PaginationParams
from ....services.exceptions import EntityNotFoundError
from ....schemas.response import DataResponse

router = APIRouter()

def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)

@router.post("/entities/{entity_id}/observations/", response_model=MemoryObservation)
def add_observation(
    observation: MemoryObservationCreate,
    entity_id: int = Path(..., description="The ID of the entity to add the observation to."),
<<<<<<< HEAD
<<<<<<< HEAD
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Add an observation to a memory entity."""
=======
=======
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
<<<<<<< HEAD
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Add an observation to a memory entity."""
    db_observation = memory_service.add_observation_to_entity(
        entity_id=entity_id, observation=observation
    )
    return db_observation
=======
    memory_service: MemoryService = Depends(get_memory_service)
): 
    """Add an observation to a memory entity."""
<<<<<<< HEAD
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
=======
=======
    memory_service: MemoryService = Depends(get_memory_service)
): 
    """Add an observation to a memory entity."""
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5

@router.get("/observations/", response_model=List[MemoryObservation])
async def read_observations(
    entity_id: Optional[int] = Query(
        None, description="Optional entity ID to filter observations by."
    ),
    search_query: Optional[str] = Query(
        None, description="Optional text to search within observation content."
    ),
    pagination: PaginationParams = Depends(),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Get observations, optionally filtered by entity or content search."""
<<<<<<< HEAD
<<<<<<< HEAD
    try:
        return await memory_service.get_observations(
            entity_id=entity_id,
            search_query=search_query,
            skip=pagination.offset,
            limit=pagination.page_size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.put("/observations/{observation_id}", response_model=MemoryObservation)
def update_observation_endpoint(
=======
=======
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
<<<<<<< HEAD
    return memory_service.get_observations(
        entity_id=entity_id,
        search_query=search_query,
        skip=skip,
        limit=limit,
    )

@router.put("/observations/{observation_id}", response_model=MemoryObservation)
def update_observation(
=======
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
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
<<<<<<< HEAD
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
    observation: MemoryObservationCreate,
    observation_id: int = Path(..., description="ID of the observation to update."),
    memory_service: MemoryService = Depends(get_memory_service),
):
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
<<<<<<< HEAD
    """Update an existing memory observation."""
    db_obs = memory_service.update_observation(observation_id, observation)
    if db_obs is None:
        raise EntityNotFoundError("MemoryObservation", observation_id)
    return db_obs


@router.delete("/observations/{observation_id}", response_model=DataResponse[bool])
def delete_observation(
=======
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
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
<<<<<<< HEAD
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
    observation_id: int = Path(..., description="ID of the observation to delete."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Delete a memory observation."""
    try:
        success = memory_service.delete_observation(observation_id)
        if not success:
            raise EntityNotFoundError("MemoryObservation", observation_id)
<<<<<<< HEAD
<<<<<<< HEAD
        return {"message": "Memory observation deleted successfully"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
=======
=======
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
<<<<<<< HEAD
        return DataResponse[bool](data=True, message="Memory observation deleted successfully")
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
=======
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
        return {"message": "Memory observation deleted successfully"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
