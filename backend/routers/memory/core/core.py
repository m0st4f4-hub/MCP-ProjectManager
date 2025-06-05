from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from ....schemas.file_ingest import FileIngestInput

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import MemoryEntity, MemoryEntityCreate, MemoryEntityUpdate
from ....services.exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError
)
from ....auth import get_current_active_user
from ....models import User as UserModel

router = APIRouter(
    prefix="/entities",
    tags=["Memory Entities"],
)


def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)

# =============================
# CRUD Endpoints
# =============================


@router.post("/", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
def create_memory_entity_endpoint(
    entity_data: MemoryEntityCreate,
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        return memory_service.create_entity(entity_data)
    except DuplicateEntityError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/{entity_id}", response_model=MemoryEntity)
def read_memory_entity_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        db_entity = memory_service.get_entity(entity_id)
        if db_entity is None:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return db_entity
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/", response_model=List[MemoryEntity])
def list_memory_entities_endpoint(
    type: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        return memory_service.get_entities(type=type, name=name, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/by-type/{entity_type}", response_model=List[MemoryEntity])
def read_entities_by_type(
    entity_type: str = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
    skip: int = Query(0),
    limit: int = Query(100),
):
    try:
        return memory_service.get_entities_by_type(
            entity_type=entity_type,
            skip=skip,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.put("/{entity_id}", response_model=MemoryEntity)
def update_memory_entity_endpoint(
    entity_update: MemoryEntityUpdate,
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        db_entity = memory_service.update_entity(entity_id, entity_update)
        if db_entity is None:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return db_entity
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.delete("/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory_entity_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        success = memory_service.delete_entity(entity_id)
        if not success:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return {"message": "Memory entity deleted successfully"}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# =============================
# Ingestion Inputs
# =============================


class UrlIngestInput(BaseModel):
    url: str = Field(..., description="URL to ingest")


class TextIngestInput(BaseModel):
    text: str = Field(..., description="Text snippet to ingest")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata")

# =============================
# Ingestion Endpoints
# =============================


@router.post(
    "/ingest/file",
    response_model=MemoryEntity,
    status_code=status.HTTP_201_CREATED,
)
def ingest_file_endpoint(
    ingest_input: FileIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    try:
        return memory_service.ingest_file(
            ingest_input=ingest_input,
            user_id=current_user.id,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest file: {e}")


@router.post(
    "/ingest/url",
    response_model=MemoryEntity,
    status_code=status.HTTP_201_CREATED,
)
def ingest_url_endpoint(
    ingest_input: UrlIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    try:
        return memory_service.ingest_url(
            url=ingest_input.url,
            user_id=current_user.id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest url: {e}")


@router.post(
    "/ingest/text",
    response_model=MemoryEntity,
    status_code=status.HTTP_201_CREATED,
)
def ingest_text_endpoint(
    ingest_input: TextIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    try:
        return memory_service.ingest_text(
            text=ingest_input.text,
            user_id=current_user.id,
            metadata=ingest_input.metadata,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest text: {e}")

# =============================
# File Content & Metadata
# =============================


@router.get("/{entity_id}/content")
def get_file_content_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        content = memory_service.get_file_content(entity_id)
        return {"content": content}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get("/{entity_id}/metadata")
def get_file_metadata_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        metadata = memory_service.get_file_metadata(entity_id)
        return {"metadata": metadata}
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
