from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Optional

from database import get_db
from services.user_service import UserService
from services.audit_log_service import AuditLogService
from schemas.user import UserCreate, UserUpdate, UserResponse
from schemas.api_responses import DataResponse, ListResponse, PaginationParams
from services.exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError
)
from auth import get_current_active_user
from auth import RequireRole
from models import User
from enums import UserRoleEnum

router = APIRouter(
    prefix="",  # This router handles the root /users path for core user operations
    tags=["Users"],
)


async def get_user_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(db)


async def get_audit_log_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/", 
    response_model=DataResponse[User], 
    status_code=status.HTTP_201_CREATED,
    summary="Create User",
    operation_id="create_user"
)
async def create_user_endpoint(
    user_data: UserCreate,
    user_service: Annotated[UserService, Depends(get_user_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
    current_user: Annotated[User, Depends(RequireRole(allowed_roles=[UserRoleEnum.ADMIN]))]
):
    """
    Create a new user. Only accessible by Admins.
    
    - **username**: Required unique username
    - **email**: Required valid email address
    - **password**: Required password (will be hashed)
    - **full_name**: Optional full name
    """
    try:
        new_user = await user_service.create_user(user_data)
        await audit_log_service.create_log(
            action="create_user",
            details={"username": new_user.username, "roles": [role.role_name.value for role in new_user.user_roles]},
            user_id=current_user.id
        )
        return DataResponse(data=User.model_validate(new_user), message="User created successfully")
    except DuplicateEntityError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")


@router.get(
    "/{user_id}", 
    response_model=DataResponse[User],
    summary="Get User by ID",
    operation_id="get_user_by_id"
)
async def get_user_endpoint(
    user_id: Annotated[str, Path(description="ID of the user to retrieve")],
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """
    Get a user by their ID.
    
    Returns the user details if found.
    """
    try:
        user = await user_service.get_user(user_id)
        return DataResponse(data=User.model_validate(user), message="User retrieved successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")


@router.get(
    "/", 
    response_model=ListResponse[User],
    summary="Get Users",
    operation_id="get_users"
)
async def get_users_endpoint(
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(RequireRole(allowed_roles=[UserRoleEnum.ADMIN]))],
    pagination: Annotated[PaginationParams, Depends()],
    search: Annotated[Optional[str], Query(description="Search term for usernames and emails")] = None,
    role_filter: Annotated[Optional[UserRoleEnum], Query(description="Filter users by role")] = None,
    is_active: Annotated[Optional[bool], Query(description="Filter by active status")] = None,
    sort_by: Annotated[Optional[str], Query(description="Field to sort by")] = "created_at",
    sort_direction: Annotated[Optional[str], Query(description="Sort direction: asc or desc")] = "desc"
):
    """
    Get a list of users with filtering support. Only accessible by Admins.
    
    Supports pagination, search, filtering by role and active status, and sorting.
    """
    try:
        users, total_count = await user_service.get_users(
            skip=pagination.offset, 
            limit=pagination.page_size,
            search=search,
            role_filter=role_filter,
            is_active=is_active,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        
        return ListResponse(
            data=[User.model_validate(u) for u in users],
            total=total_count,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=(pagination.offset + len(users)) < total_count,
            message="Users retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving users: {e}")


@router.put(
    "/{user_id}", 
    response_model=DataResponse[User],
    summary="Update User",
    operation_id="update_user"
)
async def update_user_endpoint(
    user_id: Annotated[str, Path(description="ID of the user to update")],
    user_data: UserUpdate,
    user_service: Annotated[UserService, Depends(get_user_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """
    Update a user's information. A user can update their own info, or an admin can update any user.
    
    - **email**: Optional new email address
    - **full_name**: Optional new full name
    - **is_active**: Optional active status (admin only)
    """
    # Check if current user is admin (has admin role)
    is_admin = any(role.role_name == UserRoleEnum.ADMIN for role in current_user.user_roles)
    
    if current_user.id != user_id and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")
        
    try:
        updated_user = await user_service.update_user(user_id, user_data)
        await audit_log_service.create_log(
            action="update_user",
            details={"user_id": user_id, "updated_fields": user_data.model_dump(exclude_unset=True)},
            user_id=current_user.id
        )
        return DataResponse(data=User.model_validate(updated_user), message="User updated successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except DuplicateEntityError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")


@router.delete(
    "/{user_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete User",
    operation_id="delete_user"
)
async def delete_user_endpoint(
    user_id: Annotated[str, Path(description="ID of the user to delete")],
    user_service: Annotated[UserService, Depends(get_user_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
    current_user: Annotated[User, Depends(RequireRole(allowed_roles=[UserRoleEnum.ADMIN]))]
):
    """
    Delete a user by archiving them. Only accessible by Admins.
    
    This performs a soft delete by setting the user as inactive rather than 
    permanently removing the record.
    """
    try:
        await user_service.delete_user(user_id)
        await audit_log_service.create_log(
            action="delete_user",
            details={"user_id": user_id},
            user_id=current_user.id
        )
        return
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
