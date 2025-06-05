import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.services.user_role_service import UserRoleService

logger = logging.getLogger(__name__)


async def assign_role_tool(user_id: str, role_name: str, db: Session) -> dict:
    """MCP Tool: Assign a role to a user."""
    try:
        service = UserRoleService(db)
        role = service.assign_role_to_user(user_id=user_id, role_name=role_name)
        if role is None:
            raise HTTPException(status_code=400, detail="Role assignment failed")
        return {
            "success": True,
            "role": {
                "user_id": role.user_id,
                "role_name": role.role_name,
            },
        }
    except HTTPException as e:
        logger.error(f"MCP assign role failed with HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"MCP assign role failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_roles_tool(user_id: str, db: Session) -> dict:
    """MCP Tool: List roles for a user."""
    try:
        service = UserRoleService(db)
        roles = service.get_user_roles(user_id=user_id)
        return {
            "success": True,
            "roles": [{"user_id": r.user_id, "role_name": r.role_name} for r in roles],
        }
    except Exception as e:
        logger.error(f"MCP list roles failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def remove_role_tool(user_id: str, role_name: str, db: Session) -> dict:
    """MCP Tool: Remove a role from a user."""
    try:
        service = UserRoleService(db)
        success = service.remove_role_from_user(user_id=user_id, role_name=role_name)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
        return {"success": True}
    except HTTPException as e:
        logger.error(f"MCP remove role failed with HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"MCP remove role failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
