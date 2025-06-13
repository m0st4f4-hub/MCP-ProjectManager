"""Admin endpoints for user management."""

from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List

from database import get_db
from schemas.user import UserResponse, UserUpdate
from schemas.api_responses import DataResponse, ListResponse
from services.user_service import UserService
from auth import get_current_active_user, RoleChecker
from enums import UserRoleEnum
from models import User as UserModel
from services.exceptions import EntityNotFoundError, ValidationError
from dependencies import get_current_admin_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


async def get_user_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(db)


@router.get(
    "/users",
    response_model=ListResponse[UserResponse],
    summary="Get All Users (Admin)",
    operation_id="admin_get_all_users"
)
async def get_users(
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[UserModel, Depends(RoleChecker(allowed_roles=[UserRoleEnum.ADMIN]))]
):
    """
    Get all users in the system. Only accessible by Admins.
    
    Returns a complete list of all users including inactive ones.
    """
    try:
        users = await user_service.get_all_users()
        return ListResponse(
            data=[UserResponse.model_validate(user) for user in users],
            total=len(users),
            page=1,
            page_size=len(users),
            has_more=False,
            message="All users retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving users: {e}")


@router.put(
    "/users/{user_id}",
    response_model=DataResponse[UserResponse],
    summary="Update User (Admin)",
    operation_id="admin_update_user"
)
async def update_user(
    user_id: Annotated[str, Path(description="ID of the user to update")],
    user_data: UserUpdate,
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[UserModel, Depends(RoleChecker(allowed_roles=[UserRoleEnum.ADMIN]))]
):
    """
    Update any user's information. Only accessible by Admins.
    
    Allows admins to update any field including roles and active status.
    """
    try:
        updated_user = await user_service.update_user(user_id, user_data)
        return DataResponse(data=UserResponse.model_validate(updated_user), message="User updated successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete User (Admin)",
    operation_id="admin_delete_user"
)
async def delete_user(
    user_id: Annotated[str, Path(description="ID of the user to delete")],
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[UserModel, Depends(RoleChecker(allowed_roles=[UserRoleEnum.ADMIN]))]
):
    """
    Delete any user. Only accessible by Admins.
    
    This performs a soft delete by marking the user as inactive.
    """
    try:
        await user_service.delete_user(user_id)
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
