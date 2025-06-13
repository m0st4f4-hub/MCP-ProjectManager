from pydantic import BaseModel, ConfigDict, Field, field_validator, computed_field
from typing import Optional, List
from datetime import datetime

from ..enums import TaskStatusEnum
from .user import User
from ..validation import ValidationMixin

class TaskBase(BaseModel, ValidationMixin):
    """Base schema for task attributes."""
    title: str = Field(..., max_length=255, description="The title of the task.")
    description: Optional[str] = Field(None, description="Optional description of the task.")
    status: TaskStatusEnum = Field(default=TaskStatusEnum.TO_DO, description="Current status of the task.")
    assigned_to: Optional[str] = Field(None, description="ID of the user assigned to this task.")
    agent_id: Optional[str] = Field(None, description="ID of the agent responsible for this task.")
    start_date: Optional[datetime] = Field(None, description="When the task should start.")
    due_date: Optional[datetime] = Field(None, description="When the task is due.")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        return cls.validate_safe_string(v, max_length=255)

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if v:
            return cls.validate_safe_string(v)
        return v

class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    project_id: str = Field(..., description="ID of the project this task belongs to.")
    # task_number is auto-generated in the service layer

class TaskUpdate(BaseModel, ValidationMixin):
    """Schema for updating an existing task. All fields are optional."""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    assigned_to: Optional[str] = None
    agent_id: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None

    @field_validator('title')
    @classmethod
    def validate_optional_title(cls, v):
        if v is not None:
            return cls.validate_safe_string(v, max_length=255)
        return v

    @field_validator('description')
    @classmethod
    def validate_optional_description(cls, v):
        if v is not None:
            return cls.validate_safe_string(v)
        return v

class Task(TaskBase):
    """Schema for representing a task in API responses."""
    project_id: str = Field(..., description="ID of the project this task belongs to.")
    task_number: int = Field(..., description="Task number within the project.")
    created_at: datetime = Field(..., description="When the task was created.")
    updated_at: datetime = Field(..., description="When the task was last updated.")
    is_archived: bool = Field(default=False, description="Whether the task is archived.")
    
    # Computed fields
    @computed_field
    @property
    def id(self) -> str:
        """Composite ID for backward compatibility."""
        return f"{self.project_id}:{self.task_number}"
    
    @computed_field 
    @property
    def ai_agent_id(self) -> Optional[str]:
        """Alias for agent_id for backward compatibility."""
        return self.agent_id

    # Relationships (optional for response)
    assignee: Optional[User] = None  # Based on assigned_to field
    agent: Optional['Agent'] = None  # Based on agent_id field

    model_config = ConfigDict(from_attributes=True)

# Import Agent here to avoid circular imports
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .agent import Agent

# Task Comment schemas
class TaskCommentBase(BaseModel):
    """Base schema for task comment attributes."""
    content: str = Field(..., description="Content of the comment.")

class TaskCommentCreate(TaskCommentBase):
    """Schema for creating a new task comment."""
    pass

class TaskComment(TaskCommentBase):
    """Schema for representing a task comment in API responses."""
    id: str = Field(..., description="Unique identifier for the comment.")
    task_project_id: str = Field(..., description="Project ID of the task.")
    task_task_number: int = Field(..., description="Task number within the project.")
    user_id: str = Field(..., description="ID of the user who made the comment.")
    created_at: datetime = Field(..., description="When the comment was created.")
    updated_at: datetime = Field(..., description="When the comment was last updated.")

    # Relationships
    user: Optional[User] = None

    model_config = ConfigDict(from_attributes=True)
