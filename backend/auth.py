from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional, List

from backend.database import get_db
from backend.models import User as UserModel # Use UserModel to avoid conflict with schema
from backend.services.user_service import UserService # To fetch user
from backend.enums import UserRoleEnum # Import UserRoleEnum

# Import configuration settings
from backend.config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")

async def verify_token(token: str, credentials_exception) -> Optional[str]:
    """Verify the JWT token and return the username (sub)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    """Dependency to get the current user from a token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = await verify_token(token, credentials_exception)
    user_service = UserService(db)
    user = user_service.get_user_by_username(username=username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Dependency to get the current active user. Checks if the user is disabled."""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Implement RoleChecker
class RoleChecker:
    """Dependency to check if the current user has one of the allowed roles."""
    def __init__(self, allowed_roles: List[UserRoleEnum]):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: UserModel = Depends(get_current_active_user)):
        # Extract role names from the user's UserRole objects
        user_role_values = {role.role_name.value for role in current_user.user_roles}
        
        # Check if any of the user's roles are in the allowed roles list
        if not any(allowed_role.value in user_role_values for allowed_role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Operation not permitted. User does not have the required role."
            )
        return current_user

# Placeholder for RoleChecker, will be implemented in the next step
# class RoleChecker:
#     def __init__(self, allowed_roles: List[UserRoleEnum]):
#         self.allowed_roles = allowed_roles
# 
#     def __call__(self, current_user: UserModel = Depends(get_current_active_user)):
#         user_roles = {role.role_name for role in current_user.user_roles}
#         if not any(role in user_roles for role in self.allowed_roles):
#             raise HTTPException(status_code=403, detail="Operation not permitted")
#         return current_user 