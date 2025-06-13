"""
User schemas following FastAPI tutorial patterns.
Defines request/response models for user-related operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from enums import UserRoleEnum


class UserBase(BaseModel):
    """
    Base user model with common fields.
    """
    username: str = Field(
        ...,
        description="Unique username",
        example="john_doe",
        min_length=3,
        max_length=50
    )
    email: EmailStr = Field(
        ...,
        description="User email address",
        example="john@example.com"
    )
    full_name: Optional[str] = Field(
        None,
        description="User's full name",
        example="John Doe",
        max_length=100
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, hyphens, and underscores")
        return v.lower()


class UserCreate(UserBase):
    """
    Schema for user creation requests.
    
    Includes password field that won't be returned in responses.
    """
    password: str = Field(
        ...,
        description="User password",
        min_length=8,
        max_length=100,
        example="secure_password_123"
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        # Check for at least one letter and one number
        has_letter = any(c.isalpha() for c in v)
        has_number = any(c.isdigit() for c in v)
        
        if not (has_letter and has_number):
            raise ValueError("Password must contain at least one letter and one number")
        
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "password": "secure_password_123"
            }
        }


class UserUpdate(BaseModel):
    """
    Schema for user update requests.
    
    All fields are optional for partial updates.
    """
    username: Optional[str] = Field(
        None,
        description="New username",
        min_length=3,
        max_length=50
    )
    email: Optional[EmailStr] = Field(
        None,
        description="New email address"
    )
    full_name: Optional[str] = Field(
        None,
        description="New full name",
        max_length=100
    )
    disabled: Optional[bool] = Field(
        None,
        description="Whether user account is disabled"
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        """Validate username format if provided."""
        if v is not None:
            if not v.replace("_", "").replace("-", "").isalnum():
                raise ValueError("Username can only contain letters, numbers, hyphens, and underscores")
            return v.lower()
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "username": "new_username",
                "email": "newemail@example.com",
                "full_name": "New Full Name"
            }
        }


class UserResponse(UserBase):
    """
    Schema for user responses.
    
    Includes database fields but excludes sensitive information like passwords.
    """
    id: str = Field(
        ...,
        description="Unique user identifier",
        example="user_123456"
    )
    role: UserRoleEnum = Field(
        ...,
        description="User role in the system",
        example=UserRoleEnum.USER
    )
    disabled: bool = Field(
        ...,
        description="Whether the user account is disabled",
        example=False
    )
    is_archived: bool = Field(
        ...,
        description="Whether the user is archived",
        example=False
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp",
        example="2024-01-15T10:30:00Z"
    )
    updated_at: Optional[datetime] = Field(
        None,
        description="Last update timestamp",
        example="2024-01-20T15:45:00Z"
    )

    class Config:
        from_attributes = True  # Pydantic v2 syntax
        json_schema_extra = {
            "example": {
                "id": "user_123456",
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "role": "user",
                "disabled": False,
                "is_archived": False,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T15:45:00Z"
            }
        }


class UserList(BaseModel):
    """
    Schema for paginated user list responses.
    """
    users: list[UserResponse] = Field(
        ...,
        description="List of users"
    )
    total: int = Field(
        ...,
        description="Total number of users",
        example=150
    )
    page: int = Field(
        ...,
        description="Current page number",
        example=1
    )
    size: int = Field(
        ...,
        description="Number of items per page",
        example=20
    )
    pages: int = Field(
        ...,
        description="Total number of pages",
        example=8
    )

    class Config:
        json_schema_extra = {
            "example": {
                "users": [
                    {
                        "id": "user_123456",
                        "username": "john_doe",
                        "email": "john@example.com",
                        "full_name": "John Doe",
                        "role": "user",
                        "disabled": False,
                        "is_archived": False,
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-20T15:45:00Z"
                    }
                ],
                "total": 150,
                "page": 1,
                "size": 20,
                "pages": 8
            }
        }


class UserProfile(UserResponse):
    """
    Extended user profile with additional information.
    """
    project_count: int = Field(
        default=0,
        description="Number of projects user is involved in",
        example=5
    )
    task_count: int = Field(
        default=0,
        description="Number of tasks assigned to user",
        example=12
    )
    last_login: Optional[datetime] = Field(
        None,
        description="Last login timestamp",
        example="2024-01-20T09:15:00Z"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "user_123456",
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "role": "user",
                "disabled": False,
                "is_archived": False,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T15:45:00Z",
                "project_count": 5,
                "task_count": 12,
                "last_login": "2024-01-22T09:15:00Z"
            }
        }


class UserRoleCreate(BaseModel):
    """
    Schema for creating a new user role association.
    """
    user_id: str = Field(
        ...,
        description="The ID of the user."
    )
    role_name: UserRoleEnum = Field(
        ...,
        description="The name of the role."
    )


class UserRoleUpdate(BaseModel):
    """
    Schema for updating an existing user role association.
    """
    role_name: UserRoleEnum = Field(
        ...,
        description="The updated role name."
    )


class UserLogin(BaseModel):
    """
    Schema for user login requests.
    """
    username: str = Field(
        ...,
        description="Username for login"
    )
    password: str = Field(
        ...,
        description="Password for login"
    )