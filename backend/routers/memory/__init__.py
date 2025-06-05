from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_sync_db as get_db
from ...services.memory_service import MemoryService
from ...schemas.memory import MemoryEntity, KnowledgeGraph
from ...auth import get_current_active_user
from ...models import User as UserModel
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
async def ingest_url_root(
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
async def ingest_text_root(
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


@router.get("/graph", response_model=KnowledgeGraph)
def get_knowledge_graph(
    memory_service: MemoryService = Depends(get_memory_service),
):
    """Retrieve the entire knowledge graph."""
    try:
        return memory_service.get_knowledge_graph()
    except Exception as e:  # pragma: no cover - pass through any service errors
        raise HTTPException(status_code=500, detail=f"Failed to retrieve graph: {e}")
