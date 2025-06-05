from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
import logging

from backend.models.agent_capability import AgentCapability
from backend.services.audit_log_service import AuditLogService

logger = logging.getLogger(__name__)


async def add_capability_tool(
    agent_role_id: str,
    capability: str,
    description: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: Add a capability to an agent role."""
    try:
        item = AgentCapability(
            agent_role_id=agent_role_id,
            capability=capability,
            description=description,
            is_active=True,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        AuditLogService(db).log_action(
            action="capability_added",
            entity_type="agent_capability",
            entity_id=item.id,
            changes={"capability": capability, "description": description},
        )
        return {
            "success": True,
            "capability": {
                "id": item.id,
                "agent_role_id": item.agent_role_id,
                "capability": item.capability,
                "description": item.description,
                "is_active": item.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP add capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_capabilities_tool(
    agent_role_id: Optional[str],
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """MCP Tool: List capabilities for agent roles."""
    try:
        query = db.query(AgentCapability)
        if agent_role_id:
            query = query.filter(AgentCapability.agent_role_id == agent_role_id)
        items: List[AgentCapability] = query.offset(skip).limit(limit).all()
        return {
            "success": True,
            "capabilities": [
                {
                    "id": c.id,
                    "agent_role_id": c.agent_role_id,
                    "capability": c.capability,
                    "description": c.description,
                    "is_active": c.is_active,
                }
                for c in items
            ],
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP list capabilities failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def remove_capability_tool(capability_id: str, db: Session) -> dict:
    """MCP Tool: Remove an agent capability."""
    try:
        query = db.query(AgentCapability)
        item = query.filter(AgentCapability.id == capability_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Capability not found")
        db.delete(item)
        db.commit()
        AuditLogService(db).log_action(
            action="capability_removed",
            entity_type="agent_capability",
            entity_id=capability_id,
        )
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP remove capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
