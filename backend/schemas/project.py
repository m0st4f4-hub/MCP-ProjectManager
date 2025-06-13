from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

from .user import User
from ..enums import ProjectStatus, ProjectPriority, ProjectVisibility, ProjectMemberRole
from ..validation import ValidationMixin

class ProjectBase(BaseModel, ValidationMixin):
    """Base schema for project attributes."""
    name: str = Field(..., max_length=255, description="The unique name of the project.")
    description: Optional[str] = Field(None, description="Optional text description of the project.")
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE, description="The status of the project.")
    priority: ProjectPriority = Field(default=ProjectPriority.MEDIUM, description="The priority of the project.")
    visibility: ProjectVisibility = Field(default=ProjectVisibility.PRIVATE, description="The visibility of the project.")
    
    # Advanced metadata fields from model
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Project metadata as JSON")
    tags: Optional[List[str]] = Field(default_factory=list, description="Project tags")
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Project settings")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        return cls.validate_safe_string(v, max_length=255)

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v:
            return cls.validate_safe_string(v)
        return v

class ProjectCreate(ProjectBase):
    """Schema used for creating a new project."""
    # Note: owner_id is set automatically from current user in service layer
    pass

class ProjectUpdate(BaseModel, ValidationMixin):
    """Schema for updating an existing project. All fields are optional."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    visibility: Optional[ProjectVisibility] = None
    metadata_json: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None

    @field_validator('name')
    @classmethod
    def validate_optional_name(cls, v):
        if v is not None:
            return cls.validate_safe_string(v, max_length=255)
        return v

    @field_validator('description')
    @classmethod
    def validate_optional_description(cls, v):
        if v is not None:
            return cls.validate_safe_string(v)
        return v

class Project(ProjectBase):
    """Schema for representing a project in API responses."""
    id: str = Field(..., description="Unique identifier for the project.")
    owner_id: str = Field(..., description="ID of the user who owns the project.")
    created_by: Optional[str] = Field(None, description="ID of the user who created the project.")
    created_at: datetime = Field(..., description="Timestamp when the project was created.")
    updated_at: datetime = Field(..., description="Timestamp when the project was last updated.")
    archived_at: Optional[datetime] = Field(None, description="Timestamp when the project was archived.")
    
    # Analytics and tracking fields
    view_count: int = Field(default=0, description="Number of times project was viewed")
    activity_score: Decimal = Field(default=Decimal('0.0'), description="Activity score for the project")
    completion_percentage: Decimal = Field(default=Decimal('0.0'), description="Project completion percentage")
    task_count: int = Field(default=0, description="Total number of tasks in the project")
    completed_task_count: int = Field(default=0, description="Number of completed tasks")
    
    # Status fields
    is_archived: bool = Field(default=False, description="Whether the project is archived")
    is_deleted: bool = Field(default=False, description="Whether the project is soft-deleted")
    deleted_at: Optional[datetime] = Field(None, description="Timestamp when the project was deleted")
    
    # Relationships (optional for response)
    owner: Optional[User] = None
    members: List['ProjectMember'] = []
    
    model_config = ConfigDict(from_attributes=True)

class ProjectMemberBase(BaseModel):
    """Base schema for project member attributes."""
    project_id: str = Field(..., description="ID of the project.")
    user_id: str = Field(..., description="ID of the user.")
    role: ProjectMemberRole = Field(..., description="Role of the user in the project.")

class ProjectMemberCreate(ProjectMemberBase):
    pass

class ProjectMemberUpdate(BaseModel):
    """Schema for updating an existing project member."""
    role: Optional[ProjectMemberRole] = None

class ProjectMember(ProjectMemberBase):
    """Schema for representing a project member in API responses."""
    user: User
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Project File Association Schemas ---

class ProjectFileAssociationBase(BaseModel):
    """Base schema for project-file association attributes."""
    project_id: str = Field(
        ...,
        description="The ID of the associated project."
    )
    file_memory_entity_id: int = Field(
        ...,
        description="The ID of the associated file MemoryEntity."
    )

class ProjectFileAssociationCreate(ProjectFileAssociationBase):
    pass

class ProjectFileAssociation(ProjectFileAssociationBase):
    """Schema for representing a project-file association in API responses."""
    model_config = ConfigDict(from_attributes=True)
