"""MCP Tools for managing error protocols."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.services.error_protocol_service import ErrorProtocolService
from backend.schemas.error_protocol import ErrorProtocolCreate

logger = logging.getLogger(__name__)


def _get_service(db: Session) -> ErrorProtocolService:
    return ErrorProtocolService(db)


async def add_error_protocol_tool(
    role_id: str,
    protocol_data: ErrorProtocolCreate,
    db: Session,
) -> dict:
    """MCP Tool: Add an error protocol to an agent role."""
    try:
        service = _get_service(db)
        protocol = service.add_protocol(role_id, protocol_data)
        return {
            "success": True,
            "protocol": {
                "id": protocol.id,
                "agent_role_id": protocol.agent_role_id,
                "error_type": protocol.error_type,
                "protocol": protocol.protocol,
                "priority": protocol.priority,
                "is_active": protocol.is_active,
                "created_at": protocol.created_at.isoformat(),
            },
        }
    except Exception as exc:
        logger.error(f"MCP add error protocol failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_error_protocols_tool(
    role_id: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: List error protocols."""
    try:
        service = _get_service(db)
        protocols = service.list_protocols(role_id)
        return {
            "success": True,
            "protocols": [
                {
                    "id": p.id,
                    "agent_role_id": p.agent_role_id,
                    "error_type": p.error_type,
                    "protocol": p.protocol,
                    "priority": p.priority,
                    "is_active": p.is_active,
                    "created_at": p.created_at.isoformat(),
                }
                for p in protocols
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list error protocols failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def remove_error_protocol_tool(protocol_id: str, db: Session) -> dict:
    """MCP Tool: Remove an error protocol."""
    try:
        service = _get_service(db)
        success = service.remove_protocol(protocol_id)
        if not success:
            raise HTTPException(status_code=404, detail="Error protocol not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP remove error protocol failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
