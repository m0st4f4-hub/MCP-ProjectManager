"""
Authentication router following FastAPI Security tutorial patterns.
Implements OAuth2 password flow with JWT tokens.
"""

from datetime import timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from auth import authenticate_user, get_current_active_user
from database import get_db
from models.user import User
from security import security_manager, login_tracker
from schemas.auth import Token, TokenData
from schemas.user import UserCreate, UserResponse
from config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post(
    "/login",
    response_model=Token,
    summary="Login for access token",
    description="Authenticate with username/email and password to get access token",
    responses={
        200: {"description": "Successful authentication"},
        401: {"description": "Invalid credentials"},
        429: {"description": "Too many failed attempts"},
    }
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    The response follows OAuth2 standard with:
    - access_token: JWT token for API access
    - refresh_token: Token for refreshing access token
    - token_type: Always "bearer"
    """
    # Authenticate user
    user = await authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        # Record failed login attempt
        await login_tracker.record_attempt(
            form_data.username,
            success=False
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Record successful login
    await login_tracker.record_attempt(form_data.username, success=True)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security_manager.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = security_manager.create_refresh_token(
        data={"sub": user.username},
        expires_delta=refresh_token_expires
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="Use refresh token to get a new access token",
    responses={
        200: {"description": "Token refreshed successfully"},
        401: {"description": "Invalid refresh token"},
    }
)
async def refresh_token(
    token_data: TokenData,
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Refresh an access token using a valid refresh token.
    """
    try:
        # Verify refresh token
        payload = security_manager.verify_token(token_data.token, "refresh")
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user still exists
        from auth import get_user_by_username
        user = await get_user_by_username(db, username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = security_manager.create_access_token(
            data={"sub": username},
            expires_delta=access_token_expires
        )
        
        # Create new refresh token
        refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        new_refresh_token = security_manager.create_refresh_token(
            data={"sub": username},
            expires_delta=refresh_token_expires
        )
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user",
    responses={
        200: {"description": "Current user information"},
        401: {"description": "Not authenticated"},
    }
)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> UserResponse:
    """
    Get current user information.
    
    Returns detailed information about the authenticated user.
    """
    return UserResponse.from_orm(current_user)


@router.post(
    "/logout",
    summary="Logout user",
    description="Logout the current user (invalidate token)",
    responses={
        200: {"description": "Successfully logged out"},
        401: {"description": "Not authenticated"},
    }
)
async def logout(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, str]:
    """
    Logout current user.
    
    In a production application, you would typically:
    1. Add the token to a blacklist
    2. Clear any server-side sessions
    3. Log the logout event
    """
    # In a real implementation, you would invalidate the token
    # This could involve adding it to a Redis blacklist or database
    
    return {"message": "Successfully logged out"}


@router.post(
    "/register",
    response_model=UserResponse,
    summary="Register new user",
    description="Create a new user account",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "User already exists or invalid data"},
    }
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    Register a new user account.
    
    Creates a new user with the provided information.
    Passwords are automatically hashed before storage.
    """
    # Check if user already exists
    from auth import get_user_by_username, get_user_by_email
    
    existing_user = await get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = await get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = security_manager.hash_password(user_data.password)
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return UserResponse.from_orm(new_user)