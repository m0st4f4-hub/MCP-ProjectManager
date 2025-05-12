from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Union, Any
from datetime import datetime
from pydantic import field_validator

# --- Agent Schemas ---
class AgentBase(BaseModel):
    name: str

class AgentCreate(AgentBase):
    pass

# Schema for updating an agent (all fields optional)
class AgentUpdate(BaseModel):
    name: Optional[str] = None

class Agent(AgentBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

# Schema for updating a project (all fields optional)
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Subtask Schemas (Consolidated) ---

# Base model for subtask attributes (used for creation and output)
class SubtaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False

# Model for creating a subtask (client provides these fields)
# parent_task_id will come from the path parameter in the endpoint
class SubtaskClientCreate(SubtaskBase):
    pass

# Model for updating a subtask
class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

# Model for reading/returning a subtask (includes all fields)
class Subtask(SubtaskBase):
    id: str
    task_id: str  # Foreign key to the parent Task
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Task Schemas (Updated) ---

# Base model for common attributes
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    project_id: str
    agent_id: Optional[str] = None
    parent_task_id: Optional[str] = None


# Model for creating a task (inherits from Base, specific for creation)
class TaskCreate(TaskBase):
    agent_name: Optional[str] = None # Added for convenience during creation

    @field_validator('agent_id', 'agent_name')
    def agent_id_or_name_optional(cls, v, values, **kwargs):
        # This validator is tricky because it runs for each field independently.
        # A root_validator would be better if we needed to ensure AT MOST one is provided, or XOR.
        # For now, we'll let the CRUD logic prioritize agent_id if both are somehow passed.
        return v

# Model for updating a task (all fields optional)
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    project_id: Optional[str] = None
    agent_id: Optional[str] = None
    parent_task_id: Optional[str] = None


# --- Full Schemas (Output/Read) ---
# Configure models to work with ORM
class OrmConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class Task(TaskBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    project: Optional[Project] = None # Populated by ORM
    agent: Optional[Agent] = None     # Populated by ORM
    subtasks: List[Subtask] = []      # MODIFIED: Ensured this points to the consolidated Subtask schema
                                      # Populated by ORM, will contain Subtask schema objects

    model_config = ConfigDict(from_attributes=True)

# Rebuild models to resolve forward references for relationships
# This is crucial if you have List['ModelName'] type hints in your schemas
# that are part of relationships.
Project.model_rebuild()
Agent.model_rebuild()
Task.model_rebuild() # Task now refers to the consolidated Subtask
Subtask.model_rebuild() # Rebuild the consolidated Subtask model

# REMOVE THE DUPLICATE/OLD SubTaskBase and SubTaskCreate DEFINITIONS that were at the end
# class SubTaskBase(BaseModel):
# title: str
# description: Optional[str] = None
# completed: Optional[bool] = False
# parent_task_id: str # Subtasks must have a parent


# class SubTaskCreate(SubTaskBase):
# pass
