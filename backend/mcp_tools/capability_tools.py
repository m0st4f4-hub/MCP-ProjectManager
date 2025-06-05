"""MCP Tools for managing agent capabilities."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.services.agent_capability_service import AgentCapabilityService
from backend.schemas.agent_capability import AgentCapabilityCreate

logger = logging.getLogger(__name__)


async def create_capability_tool(
    agent_role_id: str,
    capability: str,
    description: Optional[str],
    is_active: bool,
    db: Session,
) -> dict:
    """MCP Tool: Create a capability for an agent role."""
    try:
        service = AgentCapabilityService(db)
        capability_obj = await service.create_capability(
            AgentCapabilityCreate(
                agent_role_id=agent_role_id,
                capability=capability,
                description=description,
                is_active=is_active,
            )
        )
        return {
            "success": True,
            "capability": {
                "id": capability_obj.id,
                "agent_role_id": capability_obj.agent_role_id,
                "capability": capability_obj.capability,
                "description": capability_obj.description,
                "is_active": capability_obj.is_active,
                "created_at": capability_obj.created_at.isoformat(),
            },
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP create capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_capabilities_tool(
    agent_role_id: Optional[str],
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """MCP Tool: List capabilities for agent roles."""
    try:
        service = AgentCapabilityService(db)
        capabilities = await service.list_capabilities(agent_role_id)
        return {
            "success": True,
            "capabilities": [
                {
                    "id": c.id,
                    "agent_role_id": c.agent_role_id,
                    "capability": c.capability,
                    "description": c.description,
                    "is_active": c.is_active,
                    "created_at": c.created_at.isoformat(),
                }
                for c in capabilities
            ],
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP list capabilities failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_capability_tool(capability_id: str, db: Session) -> dict:
    """MCP Tool: Delete a capability."""
    try:
        service = AgentCapabilityService(db)
        success = await service.delete_capability(capability_id)
        if not success:
            raise HTTPException(status_code=404, detail="Capability not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP delete capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
