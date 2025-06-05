import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from backend.models.universal_mandate import UniversalMandate
from backend.schemas.universal_mandate import UniversalMandateCreate
from backend.services.audit_log_service import AuditLogService

logger = logging.getLogger(__name__)


def _create_mandate(db: Session, data: UniversalMandateCreate) -> UniversalMandate:
    mandate = UniversalMandate(
        title=data.title,
        description=data.description,
        priority=data.priority,
        is_active=data.is_active,
    )
    db.add(mandate)
    db.commit()
    db.refresh(mandate)
    return mandate


async def create_mandate_tool(mandate_data: UniversalMandateCreate, db: Session) -> dict:
    """MCP Tool: Create a universal mandate."""
    try:
        mandate = _create_mandate(db, mandate_data)
        AuditLogService(db).log_action(
            action="universal_mandate_created",
            entity_type="universal_mandate",
            entity_id=mandate.id,
            changes=mandate_data.model_dump(),
        )
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
        logger.error(f"MCP create universal mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_mandates_tool(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    active_only: Optional[bool] = None,
) -> dict:
    """MCP Tool: List universal mandates."""
    try:
        query = db.query(UniversalMandate)
        if active_only is True:
            query = query.filter(UniversalMandate.is_active.is_(True))
        elif active_only is False:
            query = query.filter(UniversalMandate.is_active.is_(False))
        mandates = query.offset(skip).limit(limit).all()
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
        logger.error(f"MCP list universal mandates failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_mandate_tool(mandate_id: str, db: Session) -> dict:
    """MCP Tool: Delete a universal mandate."""
    try:
        mandate = db.query(UniversalMandate).filter(UniversalMandate.id == mandate_id).first()
        if not mandate:
            raise HTTPException(status_code=404, detail="Mandate not found")
        db.delete(mandate)
        db.commit()
        AuditLogService(db).log_action(
            action="universal_mandate_deleted",
            entity_type="universal_mandate",
            entity_id=mandate_id,
            changes={},
        )
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete universal mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
