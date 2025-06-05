"""MCP tools for managing user roles."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
import logging

from backend.services.user_role_service import UserRoleService

logger = logging.getLogger(__name__)


async def assign_user_role_tool(user_id: str, role_name: str, db: Session) -> dict:
    """Assign a role to a user."""
    try:
        service = UserRoleService(db)
        role = service.assign_role_to_user(user_id, role_name)
        return {
            "success": True,
            "user_role": {"user_id": role.user_id, "role_name": role.role_name},
        }
    except Exception as e:
        logger.error(f"MCP assign user role failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def remove_user_role_tool(user_id: str, role_name: str, db: Session) -> dict:
    """Remove a role from a user."""
    try:
        service = UserRoleService(db)
        success = service.remove_role_from_user(user_id, role_name)
        return {"success": success}
    except Exception as e:
        logger.error(f"MCP remove user role failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_user_roles_tool(user_id: str, db: Session) -> dict:
    """List all roles assigned to a user."""
    try:
        service = UserRoleService(db)
        roles = service.get_user_roles(user_id)
        return {"success": True, "roles": [r.role_name for r in roles]}
    except Exception as e:
        logger.error(f"MCP list user roles failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
