from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional, Dict, Any
from pydantic import BaseModel, Field

from ....database import get_db
from ....services.memory_service import MemoryService
from ....schemas.memory import (
    MemoryEntity,
    MemoryEntityCreate,
    MemoryEntityUpdate,
)
from ....schemas.file_ingest import FileIngestInput
from ....schemas.api_responses import DataResponse, ListResponse
from ....services.exceptions import EntityNotFoundError

router = APIRouter(
    prefix="/entities",
    tags=["Memory Entities"]
)


async def get_memory_service(db: Annotated[AsyncSession, Depends(get_db)]) -> MemoryService:
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


@router.get(
    "/",
    response_model=ListResponse[MemoryEntity],
    summary="Get Memory Entities",
    operation_id="get_memory_entities"
)
async def get_memory_entities(
    skip: int = Query(0, ge=0, description="Number of entities to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of entities to return"),
    source_type: Optional[str] = Query(None, description="Filter by source type"),
    search: Optional[str] = Query(None, description="Search entities by content"),
    memory_service: MemoryService = Depends(get_memory_service)
):
    """Get all memory entities with optional filtering."""
    try:
        if search:
            entities = await memory_service.search_entities(search, limit=limit)
            total = len(entities)
        elif source_type:
            entities = await memory_service.get_entities_by_source_type(
                source_type=source_type, skip=skip, limit=limit
            )
            total = len(entities)
        else:
            entities = await memory_service.get_entities(skip=skip, limit=limit)
            total = len(entities)
        
        return ListResponse(
            data=entities,
            total=total,
            message="Memory entities retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving memory entities: {str(e)}"
        )

@router.post(
    "/",
    response_model=DataResponse[MemoryEntity],
    status_code=status.HTTP_201_CREATED,
    summary="Create Memory Entity",
    operation_id="create_memory_entity"
)
async def create_memory_entity(
    entity: MemoryEntityCreate,
    memory_service: Annotated[MemoryService, Depends(get_memory_service)]
):
    """Create a new memory entity."""
    try:
        new_entity = await memory_service.create_entity(entity)
        return DataResponse(
            data=new_entity,
            message="Memory entity created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating memory entity: {str(e)}"
        )

@router.get(
    "/{entity_id}",
    response_model=DataResponse[MemoryEntity],
    summary="Get Memory Entity",
    operation_id="get_memory_entity"
)
async def get_memory_entity(
    entity_id: Annotated[int, Path(description="Entity ID")],
    memory_service: Annotated[MemoryService, Depends(get_memory_service)]
):
    """Get a specific memory entity by ID."""
    try:
        entity = await memory_service.get_memory_entity_by_id(entity_id)
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory entity not found"
            )
        return DataResponse(
            data=entity,
            message="Memory entity retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving memory entity: {str(e)}"
        )

@router.put(
    "/{entity_id}",
    response_model=DataResponse[MemoryEntity],
    summary="Update Memory Entity",
    operation_id="update_memory_entity"
)
async def update_memory_entity(
    entity_id: Annotated[int, Path(description="Entity ID")],
    entity_update: MemoryEntityUpdate,
    memory_service: Annotated[MemoryService, Depends(get_memory_service)]
):
    """Update an existing memory entity."""
    try:
        updated_entity = await memory_service.update_entity(entity_id, entity_update)
        if not updated_entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory entity not found"
            )
        return DataResponse(
            data=updated_entity,
            message="Memory entity updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating memory entity: {str(e)}"
        )

@router.delete(
    "/{entity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Memory Entity",
    operation_id="delete_memory_entity"
)
async def delete_memory_entity(
    entity_id: Annotated[int, Path(description="Entity ID")],
    memory_service: Annotated[MemoryService, Depends(get_memory_service)]
):
    """Delete a memory entity."""
    try:
        success = await memory_service.delete_entity(entity_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory entity not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting memory entity: {str(e)}"
        )

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
):
    try:
        return await memory_service.ingest_file(
            ingest_input=ingest_input,
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
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
):
    try:
        return await memory_service.ingest_url(
            url=ingest_input.url,
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
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
):
    try:
        return await memory_service.ingest_text(
            text=ingest_input.text,
            user_id="00000000-0000-0000-0000-000000000000",  # Placeholder
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
