# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from backend.database import get_db
from backend.services.user_service import UserService
from backend.services.audit_log_service import AuditLogService
from backend.services.exceptions import AuthorizationError
from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES
from backend.auth import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from backend.security import login_tracker  # Import specific schema classes from their files
from pydantic import BaseModel  # Placeholder for token related logic (e.g., SECRET_KEY, ALGORITHM, Token schemas)  # Should be moved to a separate auth module later  # SECRET_KEY = "your-secret-key"  # ALGORITHM = "HS256"  # ACCESS_TOKEN_EXPIRE_MINUTES = 30


router = APIRouter(
    prefix="/auth",  # Prefix specifically for authentication operations
    tags=["Authentication"],
)

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)

def get_audit_log_service(db: AsyncSession = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/token", response_model=Token)
async def login_for_access_token_form(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Authenticate user and return access token using form data."""
    return await _authenticate_user(
        form_data.username,
        form_data.password,
        user_service,
        audit_log_service,
        response,
    )

@router.post("/login", response_model=Token)
async def login_for_access_token_json(
    response: Response,
    login_data: LoginRequest,
    user_service: UserService = Depends(get_user_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Authenticate user and return access token using JSON data."""
    return await _authenticate_user(
        login_data.username,
        login_data.password,
        user_service,
        audit_log_service,
        response,
    )


@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: Request, response: Response):
    """Refresh access token using refresh token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    username = verify_refresh_token(refresh_token)
    access_token = create_access_token(data={"sub": username})
    new_refresh_token = create_refresh_token(data={"sub": username})
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        samesite="lax",
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response):
    """Clear refresh token cookie."""
    response.delete_cookie("refresh_token")
    return {"success": True}

async def _authenticate_user(
    username: str,
    password: str,
    user_service: UserService,
    audit_log_service: AuditLogService,
    response: Response,
):
    """Common authentication logic with brute force protection."""
    try:
        user = await user_service.authenticate_user(username=username, password=password)
        
        if user:
            # Record successful login
            await login_tracker.record_attempt(username, success=True)
            
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.username}, expires_delta=access_token_expires
            )
            refresh_token = create_refresh_token(data={"sub": user.username})
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                samesite="lax",
            )
            
            await audit_log_service.create_log(
                action="login_success",
                user_id=user.id,
                details={"username": user.username}
            )
            return {"access_token": access_token, "token_type": "bearer"}
        else:
            # Record failed login
            await login_tracker.record_attempt(username, success=False)
            raise AuthorizationError("Invalid credentials")
            
    except AuthorizationError:
        # Record failed login
        await login_tracker.record_attempt(username, success=False)
        
        await audit_log_service.create_log(
            action="login_failure",
            details={"username": username, "reason": "Incorrect username or password"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
