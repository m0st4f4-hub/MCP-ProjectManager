from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from ....database import get_sync_db as get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import (
    MemoryEntity,
    MemoryEntityCreate,
    MemoryEntityUpdate,
)
from ....schemas.file_ingest import FileIngestInput
from ....schemas.api_responses import DataResponse
from ....models.user import User as UserModel
from ....auth import get_current_active_user
from ....services.exceptions import EntityNotFoundError

router = APIRouter()


def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)


@router.get("/graph")
async def get_memory_graph(
    memory_service: MemoryService = Depends(get_memory_service),
    entity_type: Optional[str] = Query(None),
    relation_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1),
    offset: int = Query(0, ge=0),
):
    """Retrieve the knowledge graph with optional filters."""
    try:
        return await memory_service.get_knowledge_graph(
            entity_type=entity_type,
            relation_type=relation_type,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# =============================
# CRUD Endpoints
# =============================


@router.post("/", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
def create_memory_entity_endpoint(
    entity_data: MemoryEntityCreate,
    memory_service: MemoryService = Depends(get_memory_service),
):
    return memory_service.create_entity(entity_data)


@router.get("/{entity_id}", response_model=MemoryEntity)
def read_memory_entity_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    db_entity = memory_service.get_entity(entity_id)
    if db_entity is None:
        raise EntityNotFoundError("MemoryEntity", entity_id)
    return db_entity


@router.get("/", response_model=List[MemoryEntity])
def list_memory_entities_endpoint(
    type: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    memory_service: MemoryService = Depends(get_memory_service),
):
    return memory_service.get_entities(type=type, name=name, skip=skip, limit=limit)


@router.get("/by-type/{entity_type}", response_model=List[MemoryEntity])
def read_entities_by_type(
    entity_type: str = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
    skip: int = Query(0),
    limit: int = Query(100),
):
    return memory_service.get_entities_by_type(
        entity_type=entity_type,
        skip=skip,
        limit=limit,
    )


@router.put("/{entity_id}", response_model=MemoryEntity)
def update_memory_entity_endpoint(
    entity_update: MemoryEntityUpdate,
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    db_entity = memory_service.update_entity(entity_id, entity_update)
    if db_entity is None:
        raise EntityNotFoundError("MemoryEntity", entity_id)
    return db_entity


@router.delete("/{entity_id}", response_model=DataResponse[bool])
def delete_memory_entity_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    try:
        success = memory_service.delete_entity(entity_id)
        if not success:
            raise EntityNotFoundError("MemoryEntity", entity_id)
        return DataResponse[bool](data=True, message="Memory entity deleted successfully")
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
async def ingest_file_endpoint(
    ingest_input: FileIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    try:
        return await memory_service.ingest_file(
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
async def ingest_url_endpoint(
    ingest_input: UrlIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    try:
        return await memory_service.ingest_url(
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
async def ingest_text_endpoint(
    ingest_input: TextIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    try:
        return await memory_service.ingest_text(
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
    content = memory_service.get_file_content(entity_id)
    if content is None:
        raise EntityNotFoundError("MemoryEntity", entity_id)
    return {"content": content}


@router.get("/{entity_id}/metadata")
def get_file_metadata_endpoint(
    entity_id: int = Path(...),
    memory_service: MemoryService = Depends(get_memory_service),
):
    metadata = memory_service.get_file_metadata(entity_id)
    if metadata is None:
        raise EntityNotFoundError("MemoryEntity", entity_id)
    return metadata
