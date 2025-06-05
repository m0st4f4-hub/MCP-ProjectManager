import logging
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.agent_capability import AgentCapability

logger = logging.getLogger(__name__)


async def add_agent_capability_tool(
    agent_role_id: str,
    capability: str,
    description: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: Add a capability to an agent role."""
    try:
        new_cap = AgentCapability(
            agent_role_id=agent_role_id,
            capability=capability,
            description=description,
        )
        db.add(new_cap)
        db.commit()
        db.refresh(new_cap)
        return {
            "success": True,
            "capability": {
                "id": new_cap.id,
                "agent_role_id": new_cap.agent_role_id,
                "capability": new_cap.capability,
                "description": new_cap.description,
                "is_active": new_cap.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP add capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_agent_capabilities_tool(
    agent_role_id: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: List capabilities for an agent role."""
    try:
        query = db.query(AgentCapability)
        if agent_role_id:
            query = query.filter(AgentCapability.agent_role_id == agent_role_id)
        caps = query.all()
        return {
            "success": True,
            "capabilities": [
                {
                    "id": cap.id,
                    "agent_role_id": cap.agent_role_id,
                    "capability": cap.capability,
                    "description": cap.description,
                    "is_active": cap.is_active,
                }
                for cap in caps
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list capabilities failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def remove_agent_capability_tool(capability_id: str, db: Session) -> dict:
    """MCP Tool: Remove a capability from an agent role."""
    try:
        cap = (
            db.query(AgentCapability)
            .filter(AgentCapability.id == capability_id)
            .first()
        )
        if not cap:
            raise HTTPException(status_code=404, detail="Capability not found")
        db.delete(cap)
        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP remove capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
