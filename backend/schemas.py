from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Union, Any
from datetime import datetime
from pydantic import field_validator

# Defines Pydantic schemas for data validation and serialization.
#
# These schemas are used by FastAPI endpoints to validate incoming request data
# and to shape the structure of outgoing response data. They often correspond
# to the SQLAlchemy models defined in `models.py` but provide the API interface.

# --- Agent Schemas ---
class AgentBase(BaseModel):
    """Base schema for agent attributes."""
    name: str = Field(..., description="The unique name of the agent.")

class AgentCreate(AgentBase):
    """Schema for creating a new agent. Inherits attributes from AgentBase."""
    pass

# Schema for updating an agent (all fields optional)
class AgentUpdate(BaseModel):
    """Schema for updating an existing agent. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the agent.")

class Agent(AgentBase):
    """Schema for representing an agent in API responses (read operations)."""
    id: str = Field(..., description="Unique identifier for the agent.")
    created_at: datetime = Field(..., description="Timestamp when the agent was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the agent was last updated.")

    model_config = ConfigDict(from_attributes=True)


# --- Project Schemas ---
class ProjectBase(BaseModel):
    """Base schema for project attributes."""
    name: str = Field(..., description="The unique name of the project.")
    description: Optional[str] = Field(None, description="Optional text description of the project.")
    is_archived: bool = Field(False, description="Whether the project is archived.")

class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass

# Schema for updating a project (all fields optional)
class ProjectUpdate(BaseModel):
    """Schema for updating an existing project. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the project.")
    description: Optional[str] = Field(None, description="New description for the project.")
    is_archived: Optional[bool] = Field(None, description="Set the archived status of the project.")

class Project(ProjectBase):
    """Schema for representing a project in API responses."""
    id: str = Field(..., description="Unique identifier for the project.")
    created_at: datetime = Field(..., description="Timestamp when the project was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the project was last updated.")
    task_count: int = Field(0, description="Number of tasks associated with this project.")
    # is_archived is inherited from ProjectBase
    model_config = ConfigDict(from_attributes=True)


# --- Task Schemas (Updated) ---

# Base model for common attributes
class TaskBase(BaseModel):
    """Base schema for task attributes."""
    title: str = Field(..., description="Title of the task.")
    description: Optional[str] = Field(None, description="Optional description for the task.")
    status: Optional[str] = Field("To Do", description="Status of the task. One of: 'To Do', 'In Progress', 'Blocked', 'Completed'.")
    project_id: str = Field(..., description="Identifier of the project this task belongs to.")
    agent_id: Optional[str] = Field(None, description="Identifier of the agent assigned to this task (optional).")
    is_archived: bool = Field(False, description="Whether the task is archived.")
    # parent_task_id is intentionally NOT included here, handled by Subtask relationship
    # If supporting parent tasks directly on Task model, add it here.
    # parent_task_id: Optional[str] = Field(None, description="Identifier of the parent task (optional, for hierarchical tasks).")


# Model for creating a task (inherits from Base, specific for creation)
class TaskCreate(TaskBase):
    """Schema used for creating a new task.
    Allows specifying agent by name for convenience during creation.
    """
    agent_name: Optional[str] = Field(None, description="Name of the agent to assign (alternative to agent_id).")

    # Note: The validator below is currently basic. API logic handles precedence.
    # @field_validator('agent_id', 'agent_name')
    # def agent_id_or_name_optional(cls, v, values, **kwargs):
    #     """Allows either agent_id or agent_name but not necessarily enforcing mutual exclusivity at schema level."""
    #     return v

# Model for updating a task (all fields optional)
class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""
    title: Optional[str] = Field(None, description="New title for the task.")
    description: Optional[str] = Field(None, description="New description for the task.")
    status: Optional[str] = Field(None, description="New status for the task. One of: 'To Do', 'In Progress', 'Blocked', 'Completed'.")
    project_id: Optional[str] = Field(None, description="New project ID for the task.")
    agent_id: Optional[str] = Field(None, description="New agent ID for the task.")
    is_archived: Optional[bool] = Field(None, description="Set the archived status of the task.")
    # parent_task_id: Optional[str] = Field(None, description="New parent task ID (if supported directly).")


# --- Full Schemas (Output/Read) ---
# Configure models to work with ORM
# Note: OrmConfig class is not used directly here, config applied individually.
# class OrmConfig(BaseModel):
#     model_config = ConfigDict(from_attributes=True)

class Task(TaskBase):
    """Schema for representing a task in API responses, including relationships."""
    id: str = Field(..., description="Unique identifier for the task.")
    created_at: datetime = Field(..., description="Timestamp when the task was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the task was last updated.")
    # is_archived is inherited from TaskBase
    
    project: Optional[Project] = Field(None, description="The project this task belongs to (populated from ORM).")
    agent: Optional[Agent] = Field(None, description="The agent assigned to this task (populated from ORM).")

    model_config = ConfigDict(from_attributes=True)

# Rebuild models to resolve forward references for relationships
# This is crucial if you have List['ModelName'] type hints in your schemas
# that are part of relationships.
Project.model_rebuild()
Agent.model_rebuild()
Task.model_rebuild() # Task now refers to the consolidated Subtask
