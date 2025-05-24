# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..database import get_db
from ..services.user_service import UserService
from ..services.user_role_service import UserRoleService


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


@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
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


@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a user by ID."""
    db_user = user_service.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a list of users."""
    users = user_service.get_users(skip=skip, limit=limit)
    return users


@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: str,
    user_update: schemas.UserUpdate,
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


@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Delete a user by ID."""
    db_user = user_service.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    deleted_user = user_service.delete_user(user_id=user_id)
    if deleted_user is None:
        raise HTTPException(status_code=500, detail="User deletion failed")
    return deleted_user


@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    """Authenticate user and return access token (placeholder)."""
    user = user_service.authenticate_user(
        username=form_data.username,
        password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # In a real app, create the access token here
    # access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # access_token = create_access_token(
    #     data={"sub": user.username}, expires_delta=access_token_expires
    # )
    # return {"access_token": access_token, "token_type": "bearer"}
    # Return user info for now
    return {
        "message": (
            "Authentication successful (placeholder for token)"
        ),
        "user": schemas.User.from_orm(user)
    }

# Example of a protected endpoint (requires authentication)
# @router.get("/me/", response_model=schemas.User)
# async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
#     return current_user

# Placeholder for get_current_active_user (requires token verification logic)
# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     # Verify token and return user
#     pass

# async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
#     if current_user.disabled:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user
