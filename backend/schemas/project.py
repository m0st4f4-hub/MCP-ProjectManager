from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

from ..enums import ProjectStatus, ProjectPriority

class ProjectBase(BaseModel):
    """Base schema for project attributes."""
    name: str = Field(..., max_length=255, description="The unique name of the project.")
    description: Optional[str] = Field(None, description="Optional text description of the project.")
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE, description="The status of the project.")
    priority: ProjectPriority = Field(default=ProjectPriority.MEDIUM, description="The priority of the project.")
    
    # Advanced metadata fields from model
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Project metadata as JSON")
    tags: Optional[List[str]] = Field(default_factory=list, description="Project tags")
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Project settings")
    

class ProjectCreate(ProjectBase):
    """Schema used for creating a new project."""
    # Note: owner_id is set automatically from current user in service layer
    pass

class ProjectUpdate(BaseModel):
    """Schema for updating an existing project. All fields are optional."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    metadata_json: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None


class Project(ProjectBase):
    """Schema for representing a project in API responses."""
    id: str = Field(..., description="Unique identifier for the project.")
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
    
    
    model_config = ConfigDict(from_attributes=True)

class ProjectFileAssociationCreate(BaseModel):
    project_id: str
    file_memory_entity_id: int

class ProjectFileAssociation(ProjectFileAssociationCreate):
    """Schema for representing a project file association in API responses."""
    model_config = ConfigDict(from_attributes=True)

