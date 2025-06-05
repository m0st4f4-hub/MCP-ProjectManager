import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.services.rules_service import RulesService
from backend.schemas.universal_mandate import UniversalMandateCreate

logger = logging.getLogger(__name__)


async def create_mandate_tool(
    mandate_data: UniversalMandateCreate, db: Session
) -> dict:
    """MCP Tool: Create a universal mandate."""
    try:
        service = RulesService(db)
        mandate = service.create_universal_mandate(mandate_data)
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
    except Exception as exc:  # pragma: no cover - DB failure
        logger.error(f"MCP create mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_mandates_tool(active_only: bool, db: Session) -> dict:
    """MCP Tool: List universal mandates."""
    try:
        service = RulesService(db)
        mandates = service.list_universal_mandates(active_only=active_only)
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
    except Exception as exc:  # pragma: no cover - DB failure
        logger.error(f"MCP list mandates failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_mandate_tool(mandate_id: str, db: Session) -> dict:
    """MCP Tool: Delete a universal mandate."""
    try:
        service = RulesService(db)
        success = service.delete_universal_mandate(mandate_id)
        if not success:
            raise HTTPException(status_code=404, detail="Mandate not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - DB failure
        logger.error(f"MCP delete mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
