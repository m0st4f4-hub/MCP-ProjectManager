"""Admin endpoints for user management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.schemas.user import User, UserUpdate
from backend.schemas.api_responses import DataResponse, ListResponse
from backend.services.user_service import UserService
from backend.auth import get_current_active_user, RoleChecker
from backend.enums import UserRoleEnum
from backend.models import User as UserModel

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN]))]
)


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


@router.get("/users", response_model=ListResponse[User])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get all users. Admin only."""
    users = await user_service.get_users(skip=skip, limit=limit)
    total = await user_service.count_users()
    return ListResponse[User](
        items=[User.model_validate(u) for u in users],
        total=total,
        page=skip // limit + 1,
        page_size=limit,
        has_more=skip + len(users) < total
    )


@router.put("/users/{user_id}", response_model=DataResponse[User])
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    user_service: UserService = Depends(get_user_service),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Update a user. Admin only."""
    try:
        updated_user = await user_service.update_user(user_id, user_update)
        return DataResponse[User](
            data=User.model_validate(updated_user),
            message="User updated successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/users/{user_id}", response_model=DataResponse[bool])
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Delete a user. Admin only."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    try:
        await user_service.delete_user(user_id)
        return DataResponse[bool](data=True, message="User deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
