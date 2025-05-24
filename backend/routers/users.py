# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

# from .. import schemas # Remove the old import
from ..database import get_db
from ..services.user_service import UserService
from ..services.user_role_service import UserRoleService
from backend.services.audit_log_service import AuditLogService

# Import specific schema classes from their files
from backend.schemas.user import User, UserCreate, UserUpdate # Import User, UserCreate, UserUpdate from user.py
# Define a Token schema for the response model
from pydantic import BaseModel

# Import auth dependencies and UserRoleEnum
from backend.auth import get_current_active_user, RoleChecker
from backend.enums import UserRoleEnum
from backend.models import User as UserModel # For type hinting current_user

# Placeholder for token related logic (e.g., SECRET_KEY, ALGORITHM, Token schemas)
# Should be moved to a separate auth module later
# SECRET_KEY = "your-secret-key"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Placeholder for OAuth2 password bearer flow
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


def get_user_role_service(db: Session = Depends(get_db)) -> UserRoleService:
    return UserRoleService(db)


# Dependency for AuditLogService
def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post("/", response_model=User)
def create_user(
    user: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Create a new user."""
    db_user = user_service.get_user_by_username(username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400, detail="Username already registered"
        )
    # In a real app, hash the password before storing
    return user_service.create_user(user=user)


@router.get("/{user_id}", response_model=User)
def read_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a user by ID."""
    db_user = user_service.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=List[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a list of users."""
    users = user_service.get_users(skip=skip, limit=limit)
    return users


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: str,
    user_update: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """Update a user by ID."""
    db_user = user_service.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = user_service.update_user(
        user_id=user_id,
        user_update=user_update
    )
    if updated_user is None:
        raise HTTPException(status_code=500, detail="User update failed")
    return updated_user


@router.delete("/{user_id}", response_model=User,
               dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN]))]) # Protect endpoint
def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    current_user: UserModel = Depends(get_current_active_user) # Inject current user
):
    """Delete a user by ID. Requires ADMIN role."""
    db_user = user_service.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    deleted_user = user_service.delete_user(user_id=user_id)
    if deleted_user is None:
        raise HTTPException(status_code=500, detail="User deletion failed")
    return deleted_user


class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
    """Authenticate user and return access token."""
    user = user_service.authenticate_user(
        username=form_data.username,
        password=form_data.password
    )
    if not user:
        # Log failed login attempt
        audit_log_service.create_log(
            action="login_failure",
            details={"username": form_data.username, "reason": "Incorrect username or password"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create the access token
    access_token_expires = timedelta(minutes=user_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = user_service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    # Log successful login
    audit_log_service.create_log(
        action="login_success",
        user_id=user.id,
        details={"username": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Example of a protected endpoint (requires authentication)
# @router.get("/me/", response_model=User)
# async def read_users_me(current_user: User = Depends(get_current_active_user)):
#     return current_user

# Placeholder for get_current_active_user (requires token verification logic)
# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     # Verify token and return user
#     pass

# async def get_current_active_user(current_user: User = Depends(get_current_user)):
#     if current_user.disabled:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user
