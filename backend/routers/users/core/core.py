from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.services.user_service import UserService
from backend.services.audit_log_service import AuditLogService

from backend.schemas.user import User, UserCreate, UserUpdate
from backend.schemas.api_responses import (
    DataResponse, ListResponse, PaginationParams
)
# Import auth dependencies and UserRoleEnum for the delete endpoint
from backend.services.exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError
)
from backend.auth import get_current_active_user
from backend.auth import RoleChecker
from backend.enums import UserRoleEnum
# For type hinting current_user
from backend.models import User as UserModel

router = APIRouter(
    prefix="",  # This router handles the root /users path for core user operations
    tags=["Users"],
)


async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)  # Dependency for AuditLogService


async def get_audit_log_service(db: AsyncSession = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post("/", response_model=DataResponse[User])
async def create_user(
    user: UserCreate,
    user_service: UserService = Depends(get_user_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)  # Inject AuditLogService
):
    """Create a new user."""
    try:
        db_user = await user_service.create_user(user=user)  # Log user creation
        await audit_log_service.create_log(
            action="create_user",
            details={"username": user.username}
        )  # Return standardized response
        return DataResponse[User](
            data=User.model_validate(db_user),
            message=(
                f"User '{user.username}' created successfully"
            )
        )
    except DuplicateEntityError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating user: {str(e)}"
        )

@router.get("/{user_id}", response_model=DataResponse[User])
async def read_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a user by ID."""
    try:
        db_user = await user_service.get_user(user_id=user_id)  # Return standardized response
        return DataResponse[User](
            data=User.model_validate(db_user),
            message=f"User retrieved successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user: {str(e)}"
        )

@router.get("/", response_model=ListResponse[User])
async def read_users(
    pagination: PaginationParams = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a list of users."""
    try:  # Get all users for total count
        all_users = await user_service.get_users(skip=0)
        total = len(all_users)  # Get paginated users
        users = await user_service.get_users(
            skip=pagination.offset,
            limit=pagination.page_size
        )  # Convert to Pydantic models
        pydantic_users = [User.model_validate(user) for user in users]  # Return standardized response
        return ListResponse[User](
            data=pydantic_users,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(users) < total,
            message="Retrieved " + str(len(users)) + " users"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.put("/{user_id}", response_model=DataResponse[User])
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """Update a user by ID."""
    db_user = await user_service.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = user_service.update_user(
        user_id=user_id,
        user_update=user_update
    )
    if updated_user is None:
        raise HTTPException(status_code=500, detail="User update failed")
    return updated_user

@router.delete("/{user_id}", response_model=DataResponse[bool],
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN]))])  # Protect endpoint
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    current_user: UserModel = Depends(get_current_active_user)  # Inject current user
):
    """Delete a user by ID. Requires ADMIN role."""
    try:
        db_user = await user_service.get_user(user_id=user_id)
        if db_user is None:
            raise EntityNotFoundError("User", user_id)
        deleted_user = user_service.delete_user(user_id=user_id)
        if deleted_user is None:
            raise HTTPException(status_code=500, detail="User deletion failed")  # Return standardized response
        return DataResponse[bool](
            data=True,
            message=f"User '{deleted_user.username}' deleted successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting user: {str(e)}"
        )
