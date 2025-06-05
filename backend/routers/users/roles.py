from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_sync_db as get_db
from ...services.user_role_service import UserRoleService
from ...schemas import user as user_schemas
from ...schemas.api_responses import DataResponse, ListResponse
from ...services.exceptions import EntityNotFoundError
from ...enums import UserRoleEnum

router = APIRouter(prefix="/{user_id}/roles", tags=["User Roles"])


def get_role_service(db: Session = Depends(get_db)) -> UserRoleService:
    return UserRoleService(db)


@router.post("/", response_model=DataResponse[user_schemas.UserRole], status_code=status.HTTP_201_CREATED)
def assign_role(
    user_id: str,
    role_data: user_schemas.UserRoleCreate,
    service: UserRoleService = Depends(get_role_service),
):
    """Assign a role to a user."""
    if role_data.user_id and role_data.user_id != user_id:
        role_data.user_id = user_id
    try:
        role = service.assign_role_to_user(user_id, role_data.role_name.value)
        return DataResponse[user_schemas.UserRole](
            data=user_schemas.UserRole.model_validate(role),
            message="Role assigned successfully",
        )
    except Exception as exc:  # pragma: no cover - unexpected errors
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/", response_model=ListResponse[user_schemas.UserRole])
def list_roles(
    user_id: str,
    service: UserRoleService = Depends(get_role_service),
):
    """List roles for a user."""
    roles = service.get_user_roles(user_id)
    pydantic_roles = [user_schemas.UserRole.model_validate(r) for r in roles]
    return ListResponse[user_schemas.UserRole](
        data=pydantic_roles,
        total=len(pydantic_roles),
        page=1,
        page_size=len(pydantic_roles),
        has_more=False,
        message=f"Retrieved {len(pydantic_roles)} roles",
    )


@router.put("/{role}", response_model=DataResponse[user_schemas.UserRole])
def update_role(
    user_id: str,
    role: UserRoleEnum,
    role_update: user_schemas.UserRoleUpdate,
    service: UserRoleService = Depends(get_role_service),
):
    """Update a role for a user."""
    try:
        updated = service.update_user_role(user_id, role.value, role_update.role_name.value)
        if not updated:
            raise EntityNotFoundError("UserRole", role.value)
        return DataResponse[user_schemas.UserRole](
            data=user_schemas.UserRole.model_validate(updated),
            message="Role updated successfully",
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as exc:  # pragma: no cover - unexpected errors
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/{role}", response_model=DataResponse[bool])
def remove_role(
    user_id: str,
    role: UserRoleEnum,
    service: UserRoleService = Depends(get_role_service),
):
    """Remove a role from a user."""
    try:
        success = service.remove_role_from_user(user_id, role.value)
        if not success:
            raise EntityNotFoundError("UserRole", role.value)
        return DataResponse[bool](data=True, message="Role removed successfully")
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as exc:  # pragma: no cover - unexpected errors
        raise HTTPException(status_code=500, detail=str(exc))
