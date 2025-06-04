# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, datetime

# Import UserRoleEnum
from ..enums import UserRoleEnum

# Forward references for relationships
# Comment = "Comment" # If Comment is in a separate module
# ProjectMember = "ProjectMember" # If ProjectMember is in a separate module

# --- User Role Schemas ---
class UserRoleBase(BaseModel):
 """Base schema for user role attributes."""
 user_id: str = Field(..., description="The ID of the user.")
 # Use UserRoleEnum for role_name
 role_name: UserRoleEnum = Field(
 ..., description="The name of the role."
 )

class UserRole(UserRoleBase):
 """Schema for representing a user role association."""
 model_config = ConfigDict(from_attributes=True)

class UserRoleCreate(UserRoleBase):
 """Schema for creating a new user role association."""
 pass

# --- User Schemas ---
class UserBase(BaseModel):
 """Base schema for user attributes."""
 username: str = Field(..., description="The unique username of the user.")
 email: str = Field(..., description="The user's email address.")
 full_name: Optional[str] = Field(None, description="The user's full name.")
 disabled: bool = Field(False, description="Whether the user account is disabled.")

class UserCreate(UserBase):
 """Schema for creating a new user."""
 password: str = Field(..., description="The user's password.")
 roles: List[UserRoleEnum] = Field(default_factory=list, description="List of roles to assign to the user.")

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