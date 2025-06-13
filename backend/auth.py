"""
Authentication and authorization module following FastAPI Security tutorial.
Implements OAuth2 with password flow and JWT tokens.
"""

from typing import List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from security import security_manager
from models.user import User
from enums import UserRoleEnum

# OAuth2 scheme for token URL
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    scheme_name="JWT"
)


async def get_user_by_username(
    db: AsyncSession,
    username: str
) -> Optional[User]:
    """
    Get user by username from database.
    
    Args:
        db: Database session
        username: Username to search for
        
    Returns:
        User object if found, None otherwise
    """
    from sqlalchemy import select
    
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(
    db: AsyncSession,
    email: str
) -> Optional[User]:
    """
    Get user by email from database.
    
    Args:
        db: Database session
        email: Email to search for
        
    Returns:
        User object if found, None otherwise
    """
    from sqlalchemy import select
    
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession,
    username: str,
    password: str
) -> Optional[User]:
    """
    Authenticate user with username and password.
    
    Args:
        db: Database session
        username: Username or email
        password: Plain text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    # Try to find user by username first, then by email
    user = await get_user_by_username(db, username)
    if not user:
        user = await get_user_by_email(db, username)
    
    if not user:
        return None
    
    if not security_manager.verify_password(password, user.hashed_password):
        return None
    
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current user from JWT token.
    
    This dependency validates the JWT token and returns the current user.
    Used in protected routes that require authentication.
    
    Args:
        token: JWT token from Authorization header
        db: Database session
        
    Returns:
        Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify and decode token
        payload = security_manager.verify_token(token, "access")
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
    except Exception:
        raise credentials_exception
    
    # Get user from database
    user = await get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    Checks if the authenticated user is active (not disabled).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current active user
        
    Raises:
        HTTPException: If user is disabled
    """
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return current_user


class RequireRole:
    """
    Dependency class to require specific user roles.
    
    Usage:
        @app.get("/admin-only")
        async def admin_endpoint(
            user: User = Depends(RequireRole([UserRoleEnum.ADMIN]))
        ):
            return {"message": "Admin access granted"}
    """
    
    def __init__(self, allowed_roles: List[UserRoleEnum]):
        self.allowed_roles = allowed_roles
    
    async def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """
        Validate user has required role.
        
        Args:
            current_user: Current authenticated user
            
        Returns:
            Current user if authorized
            
        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        return current_user


class RequirePermission:
    """
    Dependency class to require specific permissions.
    
    More granular than roles, allows checking specific permissions.
    """
    
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
    
    async def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """
        Validate user has required permission.
        
        Args:
            current_user: Current authenticated user
            
        Returns:
            Current user if authorized
            
        Raises:
            HTTPException: If user doesn't have permission
        """
        # Check if user has permission
        # This would typically check a user_permissions table
        # For now, we'll use role-based permissions
        
        role_permissions = {
            UserRoleEnum.ADMIN: [
                "read:all", "write:all", "delete:all", "manage:users"
            ],
            UserRoleEnum.USER: [
                "read:own", "write:own", "create:projects", "create:tasks"
            ]
        }
        
        user_permissions = role_permissions.get(current_user.role, [])
        
        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{self.required_permission}' required"
            )
        
        return current_user


# Common role dependencies for convenience
require_admin = RequireRole([UserRoleEnum.ADMIN])
require_user = RequireRole([UserRoleEnum.USER, UserRoleEnum.ADMIN])

# Common permission dependencies
require_read_all = RequirePermission("read:all")
require_write_all = RequirePermission("write:all")
require_manage_users = RequirePermission("manage:users")