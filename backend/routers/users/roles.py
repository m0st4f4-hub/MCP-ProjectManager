from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...database import get_db
from ...services.user_role_service import UserRoleService
from ...services.audit_log_service import AuditLogService
from ...auth import get_current_active_user
from ...models import User as UserModel
from ...schemas.user import UserRole, UserRoleCreate
from ...schemas.api_responses import DataResponse, ListResponse

router = APIRouter(prefix="/{user_id}/roles", tags=["User Roles"])


def get_user_role_service(db: AsyncSession = Depends(get_db)) -> UserRoleService:
    return UserRoleService(db)


def get_audit_log_service(db: AsyncSession = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/",
    response_model=DataResponse[UserRole],
    status_code=status.HTTP_201_CREATED,
)
async def assign_role(
    user_id: str,
    role: UserRoleCreate,
    user_role_service: UserRoleService = Depends(get_user_role_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Assign a role to a user."""
    if role.user_id and role.user_id != user_id:
        raise HTTPException(status_code=400, detail="user_id mismatch")

    db_role = await user_role_service.assign_role_to_user(user_id, role.role_name)
    await audit_log_service.create_log(
        action="assign_role",
        user_id=current_user.id,
        details={"target_user_id": user_id, "role": role.role_name.value},
    )
    return DataResponse[UserRole](
        data=UserRole.model_validate(db_role),
        message="Role assigned",
    )


@router.get("/", response_model=ListResponse[UserRole])
async def list_roles(
    user_id: str,
    user_role_service: UserRoleService = Depends(get_user_role_service),
):
    """List roles for a user."""
    roles = await user_role_service.get_user_roles(user_id)
    pydantic_roles = [UserRole.model_validate(r) for r in roles]
    return ListResponse[UserRole](
        data=pydantic_roles,
        total=len(pydantic_roles),
        page=1,
        page_size=len(pydantic_roles),
        has_more=False,
        message=f"Retrieved {len(pydantic_roles)} roles",
    )


@router.delete("/{role_name}", response_model=DataResponse[bool])
async def remove_role(
    user_id: str,
    role_name: str,
    user_role_service: UserRoleService = Depends(get_user_role_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Remove a role from a user."""
    success = await user_role_service.remove_role_from_user(user_id, role_name)
    if not success:
        raise HTTPException(status_code=404, detail="Role not found")

    await audit_log_service.create_log(
        action="remove_role",
        user_id=current_user.id,
        details={"target_user_id": user_id, "role": role_name},
    )
    return DataResponse[bool](data=True, message="Role removed")
