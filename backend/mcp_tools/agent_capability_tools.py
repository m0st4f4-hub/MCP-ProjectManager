"""MCP Tools for managing agent capabilities."""

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import logging
import uuid

from backend import models

logger = logging.getLogger(__name__)


async def create_capability_tool(
    agent_role_id: str,
    capability: str,
    description: Optional[str],
    db: AsyncSession,
) -> dict:
    """Create a capability for the given agent role."""
    try:
        new_cap = models.AgentCapability(
            id=str(uuid.uuid4()).replace("-", ""),
            agent_role_id=agent_role_id,
            capability=capability,
            description=description,
            is_active=True,
        )
        db.add(new_cap)
        await db.commit()
        await db.refresh(new_cap)
        return {
            "success": True,
            "capability": {
                "id": new_cap.id,
                "agent_role_id": new_cap.agent_role_id,
                "capability": new_cap.capability,
                "description": new_cap.description,
                "is_active": new_cap.is_active,
                "created_at": new_cap.created_at.isoformat(),
            },
        }
    except Exception as exc:
        logger.error(f"MCP create capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_capabilities_tool(
    agent_role_id: Optional[str],
    db: AsyncSession,
) -> dict:
    """List capabilities. Optionally filter by agent role."""
    try:
        query = select(models.AgentCapability)
        if agent_role_id:
            query = query.filter(models.AgentCapability.agent_role_id == agent_role_id)
        result = await db.execute(query)
        capabilities = result.scalars().all()
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
    except Exception as exc:
        logger.error(f"MCP list capabilities failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_capability_tool(capability_id: str, db: AsyncSession) -> dict:
    """Delete a capability by ID."""
    try:
        query = select(models.AgentCapability).filter(
            models.AgentCapability.id == capability_id
        )
        result = await db.execute(query)
        capability_obj = result.scalar_one_or_none()
        if not capability_obj:
            raise HTTPException(status_code=404, detail="Capability not found")
        await db.delete(capability_obj)
        await db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete capability failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
