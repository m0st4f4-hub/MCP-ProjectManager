from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta, timezone  # Import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession

from backend.database import get_db
from backend.models import User as UserModel  # Use UserModel to avoid conflict with schema
from backend.enums import UserRoleEnum  # Import UserRoleEnum
from backend.crud.users import get_user_by_username  # Import the async CRUD function
from backend.schemas.user import User as UserSchema  # Import User schema  # Import configuration settings
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES  # Correct import for settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

async def verify_token(token: str, credentials_exception) -> str:
    """Verify a JWT token and return the username."""
    try:  # print(f"[AUTH DEBUG] Verifying token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("[AUTH DEBUG] Username not found in token payload")
            raise credentials_exception
        return username
    except JWTError as e:
        print(f"[AUTH DEBUG] JWT Error: {e}")
        raise credentials_exception

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> UserSchema:
    """Dependency to get the current user from a token."""
    print("[AUTH DEBUG] In get_current_user")
    print(f"[AUTH DEBUG] DB session type: {type(db)}")  # Debug print
    print(f"[AUTH DEBUG] DB session is active: {db.is_active}")  # Debug print
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = await verify_token(token, credentials_exception)
    print(f"[AUTH DEBUG] Looking up user with username: {username}")  # Use the async CRUD function directly or via an async service if one exists  # Assuming get_user_by_username in crud.users is now async
    user = await get_user_by_username(db, username=username)
    if user is None:
        print(f"[AUTH DEBUG] User {username} not found, raising credentials_exception")
        raise credentials_exception
    print(f"[AUTH DEBUG] Found user: {user.username}")
    return user

async def get_current_active_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Dependency to get the current active user. Checks if the user is disabled."""
    print(f"[AUTH DEBUG] In get_current_active_user for user: {current_user.username}")
    if current_user.disabled:
        print(f"[AUTH DEBUG] User {current_user.username} is disabled, raising HTTPException")
        raise HTTPException(status_code=400, detail="Inactive user")
    print(f"[AUTH DEBUG] User {current_user.username} is active.")
    return current_user  # Implement RoleChecker


class RoleChecker:
    """Dependency to check if the current user has one of the allowed roles."""
    
    def __init__(self, allowed_roles: List[UserRoleEnum]):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: UserModel = Depends(get_current_active_user)):
        print(f"[AUTH DEBUG] In RoleChecker for user: {current_user.username}")
        print(f"[AUTH DEBUG] User role: {current_user.role}, Allowed roles: {self.allowed_roles}")
        
        if current_user.role not in self.allowed_roles:
            print(f"[AUTH DEBUG] User {current_user.username} does not have required roles.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted."
            )
        print(f"[AUTH DEBUG] User {current_user.username} has required roles.")
        return current_user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
