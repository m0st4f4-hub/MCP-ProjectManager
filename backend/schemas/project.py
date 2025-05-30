# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Union, Any, Dict
from datetime import datetime
from .user import User # Import User directly

# Import related schemas
import uuid

# Forward references for relationships
# User = "User" # Remove string forward reference
# Project is defined within this file

# --- Project Schemas ---
class ProjectBase(BaseModel):
 """Base schema for project attributes."""
 name: str = Field(..., description="The unique name of the project.")
 description: Optional[str] = Field(
 None, description="Optional text description of the project.")
 is_archived: bool = Field(
 False, description="Whether the project is archived.")

class ProjectCreate(ProjectBase):
 """Schema used for creating a new project."""
 # Add optional template_id field
 template_id: Optional[str] = Field(None, description="Optional ID of a project template to use.")

# Schema for updating a project (all fields optional)
class ProjectUpdate(BaseModel):
 """Schema for updating an existing project. All fields are optional."""
 name: Optional[str] = Field(None, description="New name for the project.")
 description: Optional[str] = Field(
 None, description="New description for the project.")
 is_archived: Optional[bool] = Field(
 None, description="Set the archived status of the project.")

class Project(ProjectBase):
 """Schema for representing a project in API responses."""
 id: str = Field(..., description="Unique identifier for the project.")
 created_at: datetime = Field(...,
 description="Timestamp when the project was created.")
 updated_at: Optional[datetime] = Field(
 None, description="Timestamp when the project was last updated.")
 task_count: int = Field(
 0, description="Number of tasks associated with this project.")
 # is_archived is inherited from ProjectBase
 model_config = ConfigDict(from_attributes=True, extra='ignore')

# --- Project File Association Schemas ---
class ProjectFileAssociationBase(BaseModel):
 """Base schema for project-file association attributes."""
 project_id: str = Field(..., description="The ID of the associated project.")
 file_memory_entity_id: int = Field(..., description="The ID of the associated file MemoryEntity.")

class ProjectFileAssociationCreate(ProjectFileAssociationBase):
 pass

class ProjectFileAssociation(ProjectFileAssociationBase):
 model_config = ConfigDict(from_attributes=True)

# --- Project Template Schemas ---
class ProjectTemplateBase(BaseModel):
 """Base schema for project template attributes."""
 name: str = Field(..., description="The unique name of the project template.")
 description: Optional[str] = Field(
 None, description="Optional description of the template.")

class ProjectTemplateCreate(ProjectTemplateBase):
 pass

class ProjectTemplateUpdate(BaseModel):
 """Schema for updating an existing project template. All fields are optional."""
 name: Optional[str] = Field(None, description="New name for the project template.")
 description: Optional[str] = Field(None, description="New description for the template.")

class ProjectTemplate(ProjectTemplateBase):
 """Schema for representing a project template."""
 id: str = Field(..., description="Unique identifier for the project template.")

 model_config = ConfigDict(from_attributes=True)

# --- Project Member Schemas ---
class ProjectMemberBase(BaseModel):
 """Base schema for project member attributes."""
 project_id: str = Field(..., description="ID of the project.")
 user_id: str = Field(..., description="ID of the user.")
 role: str = Field(..., description="Role of the user in the project (e.g., owner, collaborator, viewer).")

class ProjectMemberCreate(ProjectMemberBase):
 pass

class ProjectMemberUpdate(BaseModel):
 """Schema for updating an existing project member."""
 role: Optional[str] = Field(None, description="Updated role of the user in the project.")

class ProjectMember(ProjectMemberBase):
 """Schema for representing a project member in API responses."""
 created_at: datetime = Field(..., description="Timestamp when the membership was created.")
 updated_at: Optional[datetime] = Field(None, description="Timestamp when the membership was last updated.")
 project: Optional[Project] = Field(None, description="The project this membership is for.")
 user: Optional[User] = Field(None, description="The user this membership is for.") # Should now use the imported User

 model_config = ConfigDict(from_attributes=True)

# Add other schemas here if necessary

# Note: model_rebuild() is called in main.py after all schemas are loaded 