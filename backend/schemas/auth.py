"""
Authentication schemas following FastAPI tutorial patterns.
Defines request/response models for authentication endpoints.
"""

from typing import Optional

from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    OAuth2 token response model.
    
    Follows OAuth2 standard for token responses with access and refresh tokens.
    """
    access_token: str = Field(
        ...,
        description="JWT access token for API authentication",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    refresh_token: str = Field(
        ...,
        description="JWT refresh token for token renewal",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer')",
        example="bearer"
    )
    expires_in: Optional[int] = Field(
        default=None,
        description="Token expiration time in seconds",
        example=1800
    )

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }


class TokenData(BaseModel):
    """
    Token data for refresh requests.
    """
    token: str = Field(
        ...,
        description="Refresh token to use for generating new access token",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class LoginRequest(BaseModel):
    """
    Login request model for non-OAuth2 endpoints.
    
    Alternative to OAuth2PasswordRequestForm for JSON-based login.
    """
    username: str = Field(
        ...,
        description="Username or email address",
        example="john_doe",
        min_length=1,
        max_length=100
    )
    password: str = Field(
        ...,
        description="User password",
        example="secure_password_123",
        min_length=8,
        max_length=100
    )

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "secure_password_123"
            }
        }


class LoginResponse(BaseModel):
    """
    Login response with user information and tokens.
    """
    user: dict = Field(
        ...,
        description="User information"
    )
    tokens: Token = Field(
        ...,
        description="Authentication tokens"
    )
    message: str = Field(
        default="Login successful",
        description="Success message"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user": {
                    "id": "user123",
                    "username": "john_doe",
                    "email": "john@example.com",
                    "full_name": "John Doe"
                },
                "tokens": {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer"
                },
                "message": "Login successful"
            }
        }


class PasswordChangeRequest(BaseModel):
    """
    Password change request model.
    """
    current_password: str = Field(
        ...,
        description="Current password for verification",
        min_length=8,
        max_length=100
    )
    new_password: str = Field(
        ...,
        description="New password",
        min_length=8,
        max_length=100
    )
    confirm_password: str = Field(
        ...,
        description="Confirmation of new password",
        min_length=8,
        max_length=100
    )

    def validate_passwords_match(self) -> bool:
        """Validate that new password and confirmation match."""
        return self.new_password == self.confirm_password

    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "old_password_123",
                "new_password": "new_secure_password_456",
                "confirm_password": "new_secure_password_456"
            }
        }


class PasswordResetRequest(BaseModel):
    """
    Password reset request model.
    """
    email: str = Field(
        ...,
        description="Email address for password reset",
        example="user@example.com"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class PasswordResetConfirm(BaseModel):
    """
    Password reset confirmation model.
    """
    token: str = Field(
        ...,
        description="Password reset token from email",
        example="reset_token_123456"
    )
    new_password: str = Field(
        ...,
        description="New password",
        min_length=8,
        max_length=100
    )
    confirm_password: str = Field(
        ...,
        description="Confirmation of new password",
        min_length=8,
        max_length=100
    )

    def validate_passwords_match(self) -> bool:
        """Validate that passwords match."""
        return self.new_password == self.confirm_password

    class Config:
        json_schema_extra = {
            "example": {
                "token": "reset_token_123456",
                "new_password": "new_secure_password_789",
                "confirm_password": "new_secure_password_789"
            }
        }