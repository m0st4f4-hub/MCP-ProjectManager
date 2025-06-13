"""
Project Model - Consolidated from enhanced and regular versions
Comprehensive project management with validation, relationships and performance
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index, JSON, Numeric, Enum
from sqlalchemy.orm import relationship, validates, Mapped, mapped_column
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from .base import Base, BaseModel, ArchivedMixin, generate_uuid_with_hyphens, JSONText
from enums import ProjectStatus, ProjectPriority, ProjectVisibility

class Project(Base):
    """Consolidated Project Model with comprehensive features"""
    __tablename__ = 'projects'
    
    id = Column(String(36), primary_key=True, default=generate_uuid_with_hyphens)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ACTIVE, index=True)
    priority = Column(Enum(ProjectPriority), default=ProjectPriority.MEDIUM, index=True)
    
    # Advanced project metadata
    metadata_json = Column(JSONText, default={})
    tags = Column(JSONText, default=[])
    settings = Column(JSONText, default={})
    
    # Analytics and tracking
    view_count = Column(Integer, default=0)
    activity_score = Column(Numeric(10, 2), default=0.0)
    completion_percentage = Column(Numeric(5, 2), default=0.0)
    
    # Computed fields (can be set dynamically)
    task_count = Column(Integer, default=0)
    completed_task_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived_at = Column(DateTime, nullable=True)
    
    # Owner and access control
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    created_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    visibility = Column(Enum(ProjectVisibility), default=ProjectVisibility.PRIVATE, index=True)
    
    # Add is_archived property for compatibility
    is_archived = Column(Boolean, default=False, nullable=False)
    
    # Soft delete
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="owned_projects", foreign_keys=[owner_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="project")
    project_members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    file_associations = relationship("ProjectFileAssociation", back_populates="project", cascade="all, delete-orphan")
    comments_on_project = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_projects_status_priority', 'status', 'priority'),
        Index('idx_projects_owner_created', 'owner_id', 'created_at'),
        Index('idx_projects_activity_score', 'activity_score'),
        Index('idx_projects_completion', 'completion_percentage'),
        Index('idx_projects_visibility', 'visibility'),
        Index('idx_projects_name_search', 'name'),
    )
    
    @validates('name')
    def validate_name(self, key, name):
        """Validate project name."""
        if not name or len(name.strip()) == 0:
            raise ValueError("Project name cannot be empty")
        if len(name.strip()) > 255:
            raise ValueError("Project name cannot exceed 255 characters")
        return name.strip()
    
    @validates('status')
    def validate_status(self, key, status):
        """Validate project status."""
        if isinstance(status, str):
            # Convert string to enum if needed
            try:
                return ProjectStatus(status)
            except ValueError:
                valid_values = [e.value for e in ProjectStatus]
                raise ValueError(f"Invalid status: {status}. Must be one of: {valid_values}")
        elif isinstance(status, ProjectStatus):
            return status
        else:
            raise ValueError(f"Status must be a ProjectStatus enum or valid string, got {type(status)}")
    
    @validates('priority')
    def validate_priority(self, key, priority):
        """Validate project priority."""
        if isinstance(priority, str):
            # Convert string to enum if needed
            try:
                return ProjectPriority(priority)
            except ValueError:
                valid_values = [e.value for e in ProjectPriority]
                raise ValueError(f"Invalid priority: {priority}. Must be one of: {valid_values}")
        elif isinstance(priority, ProjectPriority):
            return priority
        else:
            raise ValueError(f"Priority must be a ProjectPriority enum or valid string, got {type(priority)}")
    
    @validates('visibility')
    def validate_visibility(self, key, visibility):
        """Validate project visibility."""
        if isinstance(visibility, str):
            # Convert string to enum if needed
            try:
                return ProjectVisibility(visibility)
            except ValueError:
                valid_values = [e.value for e in ProjectVisibility]
                raise ValueError(f"Invalid visibility: {visibility}. Must be one of: {valid_values}")
        elif isinstance(visibility, ProjectVisibility):
            return visibility
        else:
            raise ValueError(f"Visibility must be a ProjectVisibility enum or valid string, got {type(visibility)}")
    
    @property
    def is_active(self) -> bool:
        """Check if project is active."""
        return self.status == ProjectStatus.ACTIVE and not self.is_deleted
    
    @property
    def is_completed(self) -> bool:
        """Check if project is completed."""
        return self.status == ProjectStatus.COMPLETED
    
    @property
    def progress_percentage(self) -> float:
        """Calculate completion percentage."""
        if self.task_count == 0:
            return 0.0
        return (self.completed_task_count / self.task_count) * 100.0
    
    def to_dict(self):
        """Convert project to dictionary"""
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'status': self.status.value if self.status else None,
            'priority': self.priority.value if self.priority else None,
            'metadata': self.metadata_json,
            'tags': self.tags,
            'settings': self.settings,
            'view_count': self.view_count,
            'activity_score': float(self.activity_score),
            'completion_percentage': float(self.completion_percentage),
            'task_count': self.task_count,
            'completed_task_count': self.completed_task_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'archived_at': self.archived_at.isoformat() if self.archived_at else None,
            'owner_id': str(self.owner_id),
            'visibility': self.visibility.value if self.visibility else None,
            'is_archived': self.is_archived,
            'is_deleted': self.is_deleted
        }
    
    def update_activity_score(self):
        """Calculate and update activity score based on recent tasks and interactions"""
        # Implementation would calculate based on task completions, recent updates, etc.
        # For now, simple calculation based on completion rate and recent activity
        base_score = self.progress_percentage
        
        # Boost for recent activity
        if self.updated_at and (datetime.utcnow() - self.updated_at).days < 7:
            base_score *= 1.2
        
        # Cap at 100
        self.activity_score = min(100.0, base_score)
    
    def calculate_completion_percentage(self):
        """Calculate project completion based on task progress"""
        if not self.tasks:
            self.completion_percentage = 0.0
            return 0.0
        
        completed_tasks = sum(1 for task in self.tasks if task.status == 'completed')
        percentage = (completed_tasks / len(self.tasks)) * 100.0
        self.completion_percentage = percentage
        return percentage
    
    def archive(self):
        """Archive the project."""
        self.status = ProjectStatus.ARCHIVED
        self.is_archived = True
        self.archived_at = datetime.utcnow()
    
    def soft_delete(self):
        """Soft delete the project."""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
