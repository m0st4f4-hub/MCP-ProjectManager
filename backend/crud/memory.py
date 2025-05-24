from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend import models
from backend.schemas import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate,
)
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


def get_entity_by_name(db: Session, name: str) -> Optional[models.MemoryEntity]:
    """Retrieve a memory entity by its name."""
    return db.query(models.MemoryEntity).filter(models.MemoryEntity.name == name).first()