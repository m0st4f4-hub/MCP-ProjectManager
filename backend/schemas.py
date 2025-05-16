from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

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
    project_id: Optional[int] = None
    agent_name: Optional[str] = None

# Model for creating a task (inherits from Base, specific for creation)
class TaskCreate(TaskBase):
    pass # No extra fields needed for creation beyond base

# Model for updating a task (all fields optional)
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    project_id: Optional[int] = None # Allow updating project
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
