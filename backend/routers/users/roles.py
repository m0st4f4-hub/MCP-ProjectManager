from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_sync_db as get_db
from backend.services.user_role_service import UserRoleService
from backend.schemas.user import UserRole, UserRoleCreate
from backend.schemas.api_responses import DataResponse, ListResponse

router = APIRouter(prefix="/{user_id}/roles", tags=["User Roles"])


def get_user_role_service(db: Session = Depends(get_db)) -> UserRoleService:
    return UserRoleService(db)


@router.post("/", response_model=DataResponse[UserRole])
def assign_role(user_id: str, role: UserRoleCreate, service: UserRoleService = Depends(get_user_role_service)):
    try:
        db_role = service.assign_role_to_user(user_id, role.role_name)
        return DataResponse[UserRole](
            data=UserRole.model_validate(db_role),
            message="Role assigned successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=ListResponse[UserRole])
def list_roles(user_id: str, service: UserRoleService = Depends(get_user_role_service)):
    roles = service.get_user_roles(user_id)
    return ListResponse[UserRole](
        data=[UserRole.model_validate(r) for r in roles],
        total=len(roles),
        page=1,
        page_size=len(roles),
        has_more=False,
        message=f"Retrieved {len(roles)} roles",
    )


@router.put("/{role_name}", response_model=DataResponse[UserRole])
def update_role(
    user_id: str,
    role_name: str,
    role: UserRoleCreate,
    service: UserRoleService = Depends(get_user_role_service),
):
    db_role = service.update_user_role(user_id, role_name, role.role_name)
    if not db_role:
        raise HTTPException(status_code=404, detail="User role not found")
    return DataResponse[UserRole](
        data=UserRole.model_validate(db_role),
        message="Role updated successfully",
    )


@router.delete("/{role_name}", response_model=DataResponse[dict])
def delete_role(user_id: str, role_name: str, service: UserRoleService = Depends(get_user_role_service)):
    success = service.delete_user_role(user_id, role_name)
    if not success:
        raise HTTPException(status_code=404, detail="User role not found")
    return DataResponse[dict](
        data={"message": "Role deleted successfully"},
        message="Role deleted successfully",
    )
