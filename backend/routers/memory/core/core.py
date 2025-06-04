# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import MemoryEntity, MemoryEntityCreate, MemoryEntityUpdate
from ....services.exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError
)
from ....auth import get_current_active_user  # Assuming this exists
from ....models import User as UserModel  # For type hinting current_user

router = APIRouter(
    prefix="/entities",  # Prefix specifically for core entity operations
    tags=["Memory Entities"],
)

def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)  # Endpoint for creating a MemoryEntity
@router.post("/", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)


def create_memory_entity_endpoint(
    entity_data: MemoryEntityCreate,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Create a new MemoryEntity."""
    try:
        return memory_service.create_entity(entity_data)
    except DuplicateEntityError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )  # Endpoint for getting a MemoryEntity by ID
@router.get("/{entity_id}", response_model=MemoryEntity)


def read_memory_entity_endpoint(
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Retrieve a MemoryEntity by ID."""
    try:
        db_entity = memory_service.get_entity(entity_id)
        if db_entity is None:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return db_entity
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )  # Endpoint for listing MemoryEntities
@router.get("/", response_model=List[MemoryEntity])


def list_memory_entities_endpoint(
    type: Optional[str] = Query(None, description="Optional entity type to filter by."),
    name: Optional[str] = Query(None, description="Optional entity name (partial match) to filter by."),
    skip: int = Query(0, description="The number of items to skip before returning"
        "results."),
    limit: int = Query(100, description="The maximum number of items to return."),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Retrieve a list of MemoryEntities."""
    try:
        return memory_service.get_entities(type=type, name=name, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )  # Endpoint for getting MemoryEntities by type
@router.get("/by-type/{entity_type}", response_model=List[MemoryEntity])


def read_entities_by_type(
    entity_type: str = Path(..., description="The type of entities to filter by."),
    memory_service: MemoryService = Depends(get_memory_service),
    skip: int = Query(0, description="The number of items to skip before returning"
        "results."),
    limit: int = Query(100, description="The maximum number of items to return."),
):
    """Retrieve a list of memory entities filtered by type."""
    try:
        return memory_service.get_entities_by_type(entity_type=entity_type, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )  # Endpoint for updating a MemoryEntity
@router.put("/{entity_id}", response_model=MemoryEntity)


def update_memory_entity_endpoint(
    entity_update: MemoryEntityUpdate,
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Update a MemoryEntity by ID."""
    try:
        db_entity = memory_service.update_entity(entity_id, entity_update)
        if db_entity is None:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return db_entity
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )  # Endpoint for deleting a MemoryEntity
@router.delete("/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)


def delete_memory_entity_endpoint(
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Delete a MemoryEntity by ID."""
    try:
        success = memory_service.delete_entity(entity_id)
        if not success:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return {"message": "Memory entity deleted successfully"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )  # Endpoint for file ingestion

class FileIngestInput(BaseModel):
    file_path: str = Field(..., description="Absolute path to the file to ingest.")

@router.post("/ingest/file", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)


def ingest_file_endpoint(
    ingest_input: FileIngestInput = Body(..., description="Input data for file ingestion."),
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user)  # Protect endpoint
):
    """Ingest a file into the Knowledge Graph.

    Reads the file content and metadata and creates a MemoryEntity.
    Requires authentication.
    """
    try:  # Delegate ingestion to the service layer
        db_entity = memory_service.ingest_file(file_path=ingest_input.file_path, user_id=current_user.id)
        return db_entity
    except Exception as e:  # TODO: Handle specific file reading/metadata extraction errors more gracefully
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to ingest file: {e}")


class UrlIngestInput(BaseModel):
    url: str = Field(..., description="URL to ingest")


@router.post("/ingest/url", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
def ingest_url_endpoint(
    ingest_input: UrlIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Ingest a URL into the Knowledge Graph."""
    try:
        return memory_service.ingest_url(url=ingest_input.url, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to ingest url: {e}")


class TextIngestInput(BaseModel):
    text: str = Field(..., description="Text snippet to ingest")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata")


@router.post("/ingest/text", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
def ingest_text_endpoint(
    ingest_input: TextIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Ingest raw text into the Knowledge Graph."""
    try:
        return memory_service.ingest_text(
            text=ingest_input.text,
            user_id=current_user.id,
            metadata=ingest_input.metadata,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to ingest text: {e}")


@router.get("/{entity_id}/content")
def get_file_content_endpoint(
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Retrieve stored file content for an entity."""
    try:
        content = memory_service.get_file_content(entity_id)
        return {"content": content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/{entity_id}/metadata")
def get_file_metadata_endpoint(
    entity_id: int = Path(..., description="ID of the MemoryEntity"),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Retrieve stored file metadata for an entity."""
    try:
        metadata = memory_service.get_file_metadata(entity_id)
        return {"metadata": metadata}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
