from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import platform
import sys

from ..database import get_sync_db as get_db

router = APIRouter(
    prefix="/system",
    tags=["System"],
)

@router.get("/metrics", include_in_schema=False)
async def get_metrics():
    """Internal metrics endpoint (excluded from schema)."""
    return {"metrics": "placeholder"}

@router.get("/version")
async def get_version():
    """Get system version information."""
    return {
        "version": "2.0.1",
        "python_version": sys.version,
        "platform": platform.platform()
    }
