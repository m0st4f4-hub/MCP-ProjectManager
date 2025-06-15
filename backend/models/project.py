"""
Project Model - Simplified for single-user mode
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Index, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, ArchivedMixin, generate_uuid_with_hyphens, JSONText
from backend.enums import ProjectStatus, ProjectPriority


class Project(Base, BaseModel, ArchivedMixin):
    """Simplified Project Model for single-user mode"""
    __tablename__ = 'projects'
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ACTIVE, index=True)
    priority = Column(Enum(ProjectPriority), default=ProjectPriority.MEDIUM, index=True)
    
    # Project metadata
    metadata_json = Column(JSONText, default=dict)
    tags = Column(JSONText, default=list)
    settings = Column(JSONText, default=dict)
    
    # Analytics and tracking
    view_count = Column(Integer, default=0)
    activity_score = Column(Numeric(10, 2), default=0.0)
    completion_percentage = Column(Numeric(5, 2), default=0.0)
    
    # Computed fields
    task_count = Column(Integer, default=0)
    completed_task_count = Column(Integer, default=0)
    
    # Relationships (simplified)
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_projects_status_priority', 'status', 'priority'),
        Index('idx_projects_name_search', 'name'),
        Index('idx_projects_completion', 'completion_percentage'),
    )
    
    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}', status='{self.status.value}')>"

class ProjectFileAssociation(Base, BaseModel):
    """Association between a project and a file memory entity."""
    __tablename__ = 'project_file_associations'

    project_id = Column(String(32), ForeignKey('projects.id'), primary_key=True)
    file_memory_entity_id = Column(Integer, ForeignKey('memory_entities.id'), primary_key=True)