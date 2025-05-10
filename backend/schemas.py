from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Union
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


# --- Task Schemas (Updated) ---

# Base model for common attributes
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    # Add new fields related to project/agent
    project_id: Optional[Union[int, str]] = None
    agent_name: Optional[str] = None

    @field_validator('project_id', mode='before')
    @classmethod
    def project_id_must_be_int_or_none(cls, v: any) -> Optional[Union[int, str]]:
        if v is None:
            return None
        if isinstance(v, float) and v.is_integer():
            return int(v)
        # If v is already an int, Pydantic will handle it.
        # If v is a string like "2", Pydantic will handle it for Optional[int].
        # If it's a non-integer float or other incompatible type, 
        # Pydantic's default validation for Optional[int] will raise the error.
        return v

# Model for creating a task (inherits from Base, specific for creation)
class TaskCreate(TaskBase):
    pass # No extra fields needed for creation beyond base

# Model for updating a task (all fields optional)
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    project_id: Optional[Union[int, str]] = None # Allow updating project
    agent_name: Optional[str] = None # Allow updating agent

# If we wanted tasks listed under project:
# Project.model_rebuild() # Needed if Task was defined before Project and used in List['Task']

# --- Full Schemas (Output/Read) ---
# Configure models to work with ORM
class OrmConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class Project(ProjectBase, OrmConfig):
    id: int
    created_at: datetime
    # tasks: List[Task] = [] # Avoid circular dependency if Task includes Project

class Agent(AgentBase, OrmConfig):
    id: int
    created_at: datetime
    # tasks: List[Task] = [] # Example if needed

class Task(TaskBase, OrmConfig):
    id: int
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    project: Optional[Project] = None # Include related project details
    agent: Optional[Agent] = None     # Include related agent details

# Resolve forward references if using older Pydantic/Python
# Task.model_rebuild()
# SubTask.model_rebuild()
