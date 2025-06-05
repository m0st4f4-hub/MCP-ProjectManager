from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from backend.database import get_db
from backend.services.user_service import UserService
from backend.services.audit_log_service import AuditLogService
from backend.services.exceptions import AuthorizationError
from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES, OAUTH_REDIRECT_URI
from backend.auth import create_access_token
from backend.security import login_tracker, oauth
from backend.schemas.user import UserCreate
from backend.enums import UserRoleEnum
import uuid
from pydantic import BaseModel

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
    )


@router.post("/login", response_model=Token)
async def login_for_access_token_json(
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
    )


async def _authenticate_user(
    username: str,
    password: str,
    user_service: UserService,
    audit_log_service: AuditLogService,
):
    """Common authentication logic with brute force protection."""
    try:
        user = await user_service.authenticate_user(
            username=username,
            password=password,
        )

        if user:
            # Record successful login
            await login_tracker.record_attempt(username, success=True)

            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.username}, expires_delta=access_token_expires
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


@router.get("/oauth/login")
async def oauth_login(request: Request):
    """Redirect to external OAuth provider."""
    return await oauth.provider.authorize_redirect(request, OAUTH_REDIRECT_URI)


@router.get("/oauth/callback", response_model=Token)
async def oauth_callback(
    request: Request,
    user_service: UserService = Depends(get_user_service),
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
):
    """Handle OAuth callback and issue JWT."""
    try:
        token = await oauth.provider.authorize_access_token(request)
        user_info = await oauth.provider.parse_id_token(request, token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    username = user_info.get("email")
    full_name = user_info.get("name")
    user = await user_service.get_user_by_username(username)
    if not user:
        user_create = UserCreate(
            username=username,
            email=username,
            full_name=full_name,
            password=str(uuid.uuid4()),
            roles=[UserRoleEnum.USER],
        )
        user = await user_service.create_user(user_create)

    await audit_log_service.create_log(
        action="login_success",
        user_id=user.id,
        details={"username": user.username, "method": "oauth"},
    )

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
