from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ....database import get_sync_db as get_db
from ....crud import rules as crud_rules
from ....schemas.universal_mandate import (
    UniversalMandate,
    UniversalMandateCreate,
    UniversalMandateUpdate
)

router = APIRouter()  # Universal Mandates Endpoints
@router.get("/", response_model=List[UniversalMandate])


def get_mandates(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all universal mandates"""
    return crud_rules.get_universal_mandates(db, active_only=active_only)

@router.post("/", response_model=UniversalMandate)


def create_mandate(
    mandate: UniversalMandateCreate,
    db: Session = Depends(get_db)
):
    """Create a new universal mandate"""
    return crud_rules.create_universal_mandate(db, mandate)

@router.put("/{mandate_id}", response_model=UniversalMandate)


def update_mandate(
    mandate_id: str,
    mandate_update: UniversalMandateUpdate,
    db: Session = Depends(get_db)
):
    """Update a universal mandate"""
    result = crud_rules.update_universal_mandate(db, mandate_id, mandate_update)
    if not result:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return result

@router.delete("/{mandate_id}")


def delete_mandate(
    mandate_id: str,
    db: Session = Depends(get_db),
):
    """Delete a universal mandate"""
    success = crud_rules.delete_universal_mandate(db, mandate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return {"message": "Universal mandate deleted successfully"}
