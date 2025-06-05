"""MCP Tools for managing error handling protocols."""

import logging
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend import models

logger = logging.getLogger(__name__)


async def create_error_protocol_tool(
    role_id: str,
    error_type: str,
    protocol: str,
    priority: int = 5,
    is_active: bool = True,
    db: Session | None = None,
) -> dict:
    """MCP Tool: Create a new error protocol for an agent role."""
    try:
        new_protocol = models.AgentErrorProtocol(
            id=str(uuid.uuid4()).replace("-", ""),
            agent_role_id=role_id,
            error_type=error_type,
            protocol=protocol,
            priority=priority,
            is_active=is_active,
        )
        db.add(new_protocol)
        db.commit()
        db.refresh(new_protocol)
        return {
            "success": True,
            "error_protocol": {
                "id": new_protocol.id,
                "agent_role_id": new_protocol.agent_role_id,
                "error_type": new_protocol.error_type,
                "protocol": new_protocol.protocol,
                "priority": new_protocol.priority,
                "is_active": new_protocol.is_active,
            },
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP create error protocol failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_error_protocols_tool(
    role_id: str,
    db: Session | None = None,
) -> dict:
    """MCP Tool: List error protocols for a given role."""
    try:
        protocols = (
            db.query(models.AgentErrorProtocol)
            .filter(models.AgentErrorProtocol.agent_role_id == role_id)
            .all()
        )
        return {
            "success": True,
            "error_protocols": [
                {
                    "id": p.id,
                    "agent_role_id": p.agent_role_id,
                    "error_type": p.error_type,
                    "protocol": p.protocol,
                    "priority": p.priority,
                    "is_active": p.is_active,
                }
                for p in protocols
            ],
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP list error protocols failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_error_protocol_tool(
    protocol_id: str,
    db: Session | None = None,
) -> dict:
    """MCP Tool: Delete an error protocol."""
    try:
        protocol = (
            db.query(models.AgentErrorProtocol)
            .filter(models.AgentErrorProtocol.id == protocol_id)
            .first()
        )
        if not protocol:
            raise HTTPException(status_code=404, detail="Error protocol not found")

        db.delete(protocol)
        db.commit()
        return {"success": True, "message": "Error protocol deleted"}
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP delete error protocol failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
