"""MCP Tools for Universal Mandates."""

import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend import models
from backend.schemas.universal_mandate import UniversalMandateCreate

logger = logging.getLogger(__name__)


async def create_mandate_tool(
    mandate_data: UniversalMandateCreate,
    db: Session,
) -> dict:
    """MCP Tool: Create a new universal mandate."""
    try:
        mandate = models.UniversalMandate(**mandate_data.model_dump())
        db.add(mandate)
        db.commit()
        db.refresh(mandate)
        return {
            "success": True,
            "mandate": {
                "id": mandate.id,
                "title": mandate.title,
                "description": mandate.description,
                "priority": mandate.priority,
                "is_active": mandate.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_mandates_tool(
    active_only: bool = True,
    db: Session | None = None,
) -> dict:
    """MCP Tool: List universal mandates."""
    try:
        query = db.query(models.UniversalMandate)
        if active_only:
            query = query.filter(models.UniversalMandate.is_active.is_(True))
        mandates = query.order_by(models.UniversalMandate.priority.desc()).all()
        return {
            "success": True,
            "mandates": [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "priority": m.priority,
                    "is_active": m.is_active,
                }
                for m in mandates
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list mandates failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_mandate_tool(
    mandate_id: str,
    db: Session,
) -> dict:
    """MCP Tool: Delete a universal mandate."""
    try:
        mandate = (
            db.query(models.UniversalMandate)
            .filter(models.UniversalMandate.id == mandate_id)
            .first()
        )
        if not mandate:
            raise HTTPException(status_code=404, detail="Mandate not found")
        db.delete(mandate)
        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
