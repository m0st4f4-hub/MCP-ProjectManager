from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, Integer, Float, 
    ForeignKey, Index, UniqueConstraint, CheckConstraint,
    JSON, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, validates
# from sqlalchemy.dialects.postgresql import UUID  # Remove PostgreSQL-specific import
from datetime import datetime
import uuid
import enum
from typing import Dict, Any, Optional

Base = declarative_base()

def generate_uuid():
    """Generate a string UUID for SQLite compatibility."""
    return str(uuid.uuid4())

class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ProjectStatus(enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"

class EnhancedProject(Base):
    """Enhanced project model with better relationships and validation."""
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)  # Use String instead of UUID
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.ACTIVE, nullable=False)
    
    # Ownership and permissions
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)  # Use String instead of UUID
    # team_id = Column(String(36), ForeignKey("teams.id"), nullable=True)  # Commented out until Team model is created
    
    # Settings and configuration
    settings = Column(JSON, default=dict)
    metadata_ = Column("metadata", JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived_at = Column(DateTime, nullable=True)
    
    # Soft delete
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="owned_projects")
    # team = relationship("Team", back_populates="projects")  # Commented out until Team model is created
    tasks = relationship("EnhancedTask", back_populates="project", cascade="all, delete-orphan")
    # milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")  # Commented out until Milestone model is created
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_project_owner_status", "owner_id", "status"),
        # Index("idx_project_team_status", "team_id", "status"),  # Commented out
        Index("idx_project_created_at", "created_at"),
        Index("idx_project_name_search", "name"),
        CheckConstraint("length(name) >= 1", name="project_name_not_empty"),
    )
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) == 0:
            raise ValueError("Project name cannot be empty")
        return name.strip()
    
    @property
    def is_archived(self) -> bool:
        return self.status == ProjectStatus.ARCHIVED
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "status": self.status.value,
            "owner_id": str(self.owner_id),
            # "team_id": str(self.team_id) if self.team_id else None,  # Commented out
            "settings": self.settings,
            "metadata": self.metadata_,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_deleted": self.is_deleted
        }

class EnhancedTask(Base):
    """Enhanced task model with comprehensive tracking."""
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)  # Use String instead of UUID
    title = Column(String(500), nullable=False)
    description = Column(Text)
    
    # Status and priority
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    
    # Relationships
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    assignee_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    parent_task_id = Column(String(36), ForeignKey("tasks.id"), nullable=True)
    
    # Time tracking
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0.0)
    logged_hours = Column(Float, default=0.0)
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional fields
    tags = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict)
    
    # Relationships
    project = relationship("EnhancedProject", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_tasks")
    parent_task = relationship("EnhancedTask", remote_side=[id], back_populates="subtasks")
    subtasks = relationship("EnhancedTask", back_populates="parent_task")
    time_logs = relationship("TimeLog", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_task_project_status", "project_id", "status"),
        Index("idx_task_assignee_status", "assignee_id", "status"),
        Index("idx_task_due_date", "due_date"),
        Index("idx_task_priority_status", "priority", "status"),
        Index("idx_task_created_at", "created_at"),
        CheckConstraint("length(title) >= 1", name="task_title_not_empty"),
        CheckConstraint("estimated_hours >= 0", name="estimated_hours_non_negative"),
        CheckConstraint("actual_hours >= 0", name="actual_hours_non_negative"),
    )
    
    @validates('title')
    def validate_title(self, key, title):
        if not title or len(title.strip()) == 0:
            raise ValueError("Task title cannot be empty")
        return title.strip()
    
    @validates('status')
    def validate_status_transition(self, key, status):
        # Add business logic for valid status transitions
        if self.status == TaskStatus.COMPLETED and status != TaskStatus.COMPLETED:
            if not hasattr(self, '_allow_status_change'):
                raise ValueError("Cannot change status of completed task without explicit permission")
        return status
    
    @property
    def is_overdue(self) -> bool:
        return (
            self.due_date is not None and 
            self.due_date < datetime.utcnow() and 
            self.status not in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]
        )
    
    @property
    def progress_percentage(self) -> float:
        if not self.estimated_hours or self.estimated_hours == 0:
            return 0.0
        return min(100.0, (self.actual_hours / self.estimated_hours) * 100)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "priority": self.priority.value,
            "project_id": str(self.project_id),
            "assignee_id": str(self.assignee_id) if self.assignee_id else None,
            "reporter_id": str(self.reporter_id),
            "parent_task_id": str(self.parent_task_id) if self.parent_task_id else None,
            "estimated_hours": self.estimated_hours,
            "actual_hours": self.actual_hours,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tags": self.tags,
            "custom_fields": self.custom_fields,
            "is_overdue": self.is_overdue,
            "progress_percentage": self.progress_percentage
        }

class User(Base):
    """Enhanced user model."""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)  # Use String instead of UUID
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    first_name = Column(String(255))
    last_name = Column(String(255))
    avatar_url = Column(String(500))
    
    # Status and permissions
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(String(50), default="user")
    permissions = Column(JSON, default=list)
    
    # Settings
    preferences = Column(JSON, default=dict)
    timezone = Column(String(50), default="UTC")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    owned_projects = relationship("EnhancedProject", back_populates="owner")
    assigned_tasks = relationship("EnhancedTask", foreign_keys="EnhancedTask.assignee_id", back_populates="assignee")
    reported_tasks = relationship("EnhancedTask", foreign_keys="EnhancedTask.reporter_id", back_populates="reporter")
    # team_memberships = relationship("TeamMembership", back_populates="user")  # Commented out until TeamMembership model is created
    
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_username", "username"),
        Index("idx_user_active", "is_active"),
    )
    
    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "role": self.role,
            "timezone": self.timezone,
            "created_at": self.created_at.isoformat(),
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None
        }

class TimeLog(Base):
    """Time tracking for tasks."""
    __tablename__ = "time_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)  # Use String instead of UUID
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    hours = Column(Float, nullable=False)
    description = Column(Text)
    
    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("EnhancedTask", back_populates="time_logs")
    user = relationship("User")
    
    __table_args__ = (
        Index("idx_timelog_task_user", "task_id", "user_id"),
        Index("idx_timelog_date", "started_at"),
        CheckConstraint("hours > 0", name="hours_positive"),
    )

class TaskComment(Base):
    """Comments on tasks."""
    __tablename__ = "task_comments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)  # Use String instead of UUID
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    task = relationship("EnhancedTask", back_populates="comments")
    user = relationship("User")
    
    __table_args__ = (
        Index("idx_comment_task_date", "task_id", "created_at"),
        CheckConstraint("length(content) >= 1", name="comment_content_not_empty"),
    )
