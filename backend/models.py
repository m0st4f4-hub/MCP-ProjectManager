from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import List, Optional
import uuid
from sqlalchemy.sql import func

from .database import Base # Import Base from database.py

class Project(Base):
    """Represents a project in the Project Manager.

    A project acts as a container for related tasks.

    Attributes:
        id: Unique identifier for the project (UUID stored as string).
        name: Name of the project (must be unique).
        description: Optional text description of the project.
        created_at: Timestamp when the project was created.
        updated_at: Timestamp when the project was last updated.
        tasks: List of tasks associated with this project.
        is_archived: Boolean flag indicating if the project is archived.
    """
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tasks: Mapped[List["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")

class Agent(Base):
    """Represents an agent that can be assigned to tasks.

    Agents are entities (e.g., users, automated systems) responsible for tasks.

    Attributes:
        id: Unique identifier for the agent (UUID stored as string).
        name: Name of the agent (must be unique).
        created_at: Timestamp when the agent was created/registered.
        updated_at: Timestamp when the agent was last updated.
        tasks: List of tasks currently assigned to this agent.
        is_archived: Boolean flag indicating if the agent is archived.
    """
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, unique=True) # Assuming agent names should be unique
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)

    tasks: Mapped[List["Task"]] = relationship(back_populates="agent", cascade="all, delete-orphan")

    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

class Task(Base):
    """Represents a single task in the Project Manager.

    Tasks belong to a Project and can optionally be assigned to an Agent.
    Tasks can also have Subtasks.

    Attributes:
        id: Unique identifier for the task (UUID stored as string).
        title: The title or name of the task.
        description: Optional detailed description of the task.
        completed: Boolean flag indicating if the task is completed.
        created_at: Timestamp when the task was created.
        updated_at: Timestamp when the task was last updated.
        project_id: Foreign key linking to the parent Project's ID.
        agent_id: Optional foreign key linking to the assigned Agent's ID.
        project: ORM relationship to the parent Project.
        agent: ORM relationship to the assigned Agent (if any).
        subtasks: List of subtasks associated with this task.
        status: The status of the task.
        is_archived: Boolean flag indicating if the task is archived.
    """
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)
    
    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"), nullable=False)
    agent_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey("agents.id"), nullable=True)

    project: Mapped["Project"] = relationship(back_populates="tasks")
    agent: Mapped[Optional["Agent"]] = relationship(back_populates="tasks")

    status: Mapped[str] = mapped_column(String, default="To Do")
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

# Base.metadata.create_all(bind=engine) # REMOVED This is typically handled by Alembic
