"""MCP tools for managing universal mandates."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
import logging

from backend import models, schemas
from backend.services.audit_log_service import AuditLogService

logger = logging.getLogger(__name__)


async def create_universal_mandate_tool(
    mandate_data: schemas.UniversalMandateCreate,
    db: Session,
) -> dict:
    """Create a new universal mandate."""
    try:
        existing = (
            db.query(models.UniversalMandate)
            .filter(models.UniversalMandate.title == mandate_data.title)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Mandate already exists")

        mandate = models.UniversalMandate(**mandate_data.model_dump())
        db.add(mandate)
        db.commit()
        db.refresh(mandate)

        audit_service = AuditLogService(db)
        if hasattr(audit_service, "log_action"):
            await audit_service.log_action(
                action="universal_mandate_created",
                entity_type="universal_mandate",
                entity_id=mandate.id,
                changes=mandate_data.model_dump(),
            )
        else:
            await audit_service.create_log(
                action="universal_mandate_created",
                details={"entity_id": mandate.id, **mandate_data.model_dump()},
            )

        return {
            "success": True,
            "mandate": {
                "id": mandate.id,
                "title": mandate.title,
                "description": mandate.description,
                "priority": mandate.priority,
                "is_active": mandate.is_active,
                "created_at": mandate.created_at.isoformat(),
            },
        }
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover - unforeseen errors
        logger.error(f"MCP create universal mandate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_universal_mandates_tool(
    active_only: bool = True,
    db: Session | None = None,
) -> dict:
    """List universal mandates."""
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
                    "created_at": m.created_at.isoformat(),
                }
                for m in mandates
            ],
        }
    except Exception as e:  # pragma: no cover - unforeseen errors
        logger.error(f"MCP list universal mandates failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_universal_mandate_tool(
    mandate_id: str,
    db: Session,
) -> dict:
    """Delete a universal mandate."""
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

        audit_service = AuditLogService(db)
        if hasattr(audit_service, "log_action"):
            await audit_service.log_action(
                action="universal_mandate_deleted",
                entity_type="universal_mandate",
                entity_id=mandate_id,
                changes=None,
            )
        else:
            await audit_service.create_log(
                action="universal_mandate_deleted",
                details={"entity_id": mandate_id},
            )

        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover - unforeseen errors
        logger.error(f"MCP delete universal mandate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
