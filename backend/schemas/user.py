from pydantic import BaseModel, ConfigDict, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime

from backend.enums import UserRoleEnum

# --- User Role Schemas ---
class UserRoleBase(BaseModel):
    """Base schema for user role attributes."""
    user_id: str = Field(..., description="The ID of the user.")
    role_name: UserRoleEnum = Field(..., description="The name of the role.")

class UserRole(UserRoleBase):
    """Schema for representing a user role association."""
    model_config = ConfigDict(from_attributes=True)

class UserRoleCreate(UserRoleBase):
    """Schema for creating a new user role association."""
    pass

class UserRoleUpdate(BaseModel):
    """Schema for updating an existing user role association."""
    role_name: UserRoleEnum = Field(..., description="The updated role name.")

# --- User Schemas ---
class UserBase(BaseModel):
    """Base schema for user attributes."""
    username: str = Field(..., min_length=3, max_length=50, description="The unique username of the user.")
    email: EmailStr = Field(..., description="The user's email address.")
    full_name: Optional[str] = Field(None, max_length=200, description="The user's full name.")
    disabled: bool = Field(False, description="Whether the user account is disabled.")
    role: UserRoleEnum = Field(default=UserRoleEnum.USER, description="Primary user role.")

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, description="The user's password.")
    roles: List[UserRoleEnum] = Field(default_factory=list, description="Additional roles to assign.")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserUpdate(BaseModel):
    """Schema for updating user attributes."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=200)
    disabled: Optional[bool] = None
    role: Optional[UserRoleEnum] = None
    password: Optional[str] = Field(None, min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class User(UserBase):
    """Schema for representing a user."""
    id: str = Field(..., description="The user's unique identifier.")
    created_at: datetime = Field(..., description="When the user was created.")
    updated_at: datetime = Field(..., description="When the user was last updated.")
    archived: bool = Field(False, description="Whether the user is archived.")
    
    # Relationships
    user_roles: List[UserRole] = Field(default_factory=list, description="User's role assignments.")
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(User):
    """Schema for user responses (excludes sensitive data)."""
    pass

class UserLogin(BaseModel):
    """Schema for user login."""
    username: str = Field(..., description="Username or email.")
    password: str = Field(..., description="User password.")

class UserTokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str = Field(..., description="JWT access token.")
    token_type: str = Field(default="bearer", description="Token type.")
    expires_in: int = Field(..., description="Token expiration time in seconds.")
    user: UserResponse = Field(..., description="User information.")

class UserUpdate(BaseModel):
 """Schema for updating an existing user. All fields are optional."""
 username: Optional[str] = Field(None, description="New username for the user.")
 email: Optional[str] = Field(None, description="New email for the user.")
 full_name: Optional[str] = Field(None, description="New full name for the user.")
 password: Optional[str] = Field(None, description="New password for the user.")
 disabled: Optional[bool] = Field(None, description="Set the disabled status of the user.")

class User(UserBase):
 """Schema for representing a user in API responses (read operations)."""
 id: str = Field(..., description="Unique identifier for the user.")
 user_roles: List["UserRole"] = [] # Forward reference to UserRole
 # Add created_at and updated_at
 created_at: datetime = Field(..., description="Timestamp when the user was created.")
 updated_at: Optional[datetime] = Field(None, description="Timestamp when the user was last updated.")
 # comments: List[Comment] = [] # Example, if Comment relationship is needed
 # project_memberships: List[ProjectMember] = [] # Example

 model_config = ConfigDict(from_attributes=True)

class UserWithRole(User):
 """Schema for representing a user with their roles."""
 user_roles: List[UserRole] = Field(..., description="List of user roles.")

# Note: model_rebuild() is called in main.py after all schemas are loaded 