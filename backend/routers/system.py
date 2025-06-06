from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy import text

from ..database import get_db
from .. import __version__

router = APIRouter(tags=["system"])

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    """Return basic health information."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"
    return {"status": "healthy", "database": db_status}


@router.get("/metrics", include_in_schema=False)
def metrics() -> Response:
    """Expose Prometheus metrics."""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/version")
def version() -> dict:
    """Return the running application version."""
    return {"version": __version__}
