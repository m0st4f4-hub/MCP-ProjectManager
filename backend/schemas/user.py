# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List

# Import UserRoleEnum
from backend.enums import UserRoleEnum

# Forward references for relationships
# Comment = "backend.schemas.comment.Comment" # If Comment is in a separate module
# ProjectMember = "backend.schemas.project.ProjectMember" # If ProjectMember is in a separate module

# --- User Schemas ---
class UserBase(BaseModel):
    """Base schema for user attributes."""
    username: str = Field(..., description="The unique username of the user.")
    email: Optional[str] = Field(None, description="The user's email address.")
    full_name: Optional[str] = Field(None, description="The user's full name.")
    disabled: Optional[bool] = Field(None, description="Whether the user account is disabled.")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., description="The user's password.")


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
    # comments: List[Comment] = [] # Example, if Comment relationship is needed
    # project_memberships: List[ProjectMember] = [] # Example

    model_config = ConfigDict(from_attributes=True)


# --- User Role Schemas ---
class UserRoleBase(BaseModel):
    """Base schema for user role attributes."""
    user_id: str = Field(..., description="The ID of the user.")
    # Use UserRoleEnum for role_name
    role_name: UserRoleEnum = Field(
        ..., description="The name of the role."
    )


class UserRoleCreate(UserRoleBase):
    """Schema for creating a new user role association."""
    pass


class UserRole(UserRoleBase):
    """Schema for representing a user role association."""
    model_config = ConfigDict(from_attributes=True)


# Resolve forward references if they are within this file or defined earlier
User.model_rebuild() # Explicitly rebuild User model
UserRole.model_rebuild() # UserRole might be used by User or vice-versa 