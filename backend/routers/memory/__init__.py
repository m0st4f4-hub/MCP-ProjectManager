<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
=======
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5

from ...database import get_sync_db as get_db
from ...services.memory_service import MemoryService
from ...schemas.memory import MemoryEntity, KnowledgeGraph
from ...auth import get_current_active_user
from ...models import User as UserModel
from fastapi import UploadFile, File
from .core.core import (
    router as core_router,
    UrlIngestInput,
    TextIngestInput,
)

router = APIRouter()
router.include_router(core_router)


def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)


@router.post(
    "/ingest-url",
    response_model=MemoryEntity,
    status_code=status.HTTP_201_CREATED,
)
<<<<<<< HEAD
<<<<<<< HEAD
async def ingest_url_root(
=======
=======
>>>>>>> origin/codex/add-search_memory_entities-endpoint
def ingest_url_root(
>>>>>>> origin/codex/add-search_memory_entities-endpoint
    ingest_input: UrlIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Ingest content directly from a URL."""
    try:
        return await memory_service.ingest_url(
            url=ingest_input.url,
            user_id=current_user.id,
        )
    except Exception as e:  # pragma: no cover - pass through any service errors
        raise HTTPException(status_code=500, detail=f"Failed to ingest url: {e}")


@router.post(
    "/ingest-text",
    response_model=MemoryEntity,
    status_code=status.HTTP_201_CREATED,
)
<<<<<<< HEAD
<<<<<<< HEAD
async def ingest_text_root(
=======
=======
>>>>>>> origin/codex/add-search_memory_entities-endpoint
def ingest_text_root(
>>>>>>> origin/codex/add-search_memory_entities-endpoint
    ingest_input: TextIngestInput,
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Store a raw text snippet as a MemoryEntity."""
    try:
        return await memory_service.ingest_text(
            text=ingest_input.text,
            user_id=current_user.id,
            metadata=ingest_input.metadata,
        )
    except Exception as e:  # pragma: no cover - pass through any service errors
        raise HTTPException(status_code=500, detail=f"Failed to ingest text: {e}")


<<<<<<< HEAD
@router.post("/ingest/upload", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
async def ingest_upload_root(
    file: UploadFile = File(...),
=======
@router.post("/ingest", response_model=MemoryEntity, status_code=status.HTTP_201_CREATED)
async def ingest_file_upload(
    file: UploadFile = File(...),
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Upload a file and store it as a MemoryEntity."""
    try:
        content = await file.read()
        return memory_service.ingest_uploaded_file(
            filename=file.filename,
            content=content,
            content_type=file.content_type or "application/octet-stream",
            user_id=current_user.id,
        )
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to ingest file: {e}")


@router.get("/graph", response_model=KnowledgeGraph)
def get_knowledge_graph(
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
    memory_service: MemoryService = Depends(get_memory_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Upload a file and ingest it into the knowledge graph."""
    try:
        return await memory_service.ingest_file(file, user_id=current_user.id)
    except Exception as e:  # pragma: no cover - pass through any service errors
        raise HTTPException(status_code=500, detail=f"Failed to ingest file: {e}")


@router.get("/graph", response_model=KnowledgeGraph)
async def get_knowledge_graph(
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
    except Exception as e:  # pragma: no cover - pass through any service errors
        raise HTTPException(status_code=500, detail=f"Failed to retrieve graph: {e}")


@router.get("/search", response_model=List[MemoryEntity])
def search_memory_entities(
    query: str = Query(..., description="Text to search for in entity content."),
    limit: int = Query(10, description="Maximum number of results to return."),
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Search memory entities by content text."""
    try:
        return memory_service.search_memory_entities(query=query, limit=limit)
    except Exception as e:  # pragma: no cover - pass through any service errors
        raise HTTPException(status_code=500, detail=f"Failed to search memory: {e}")
