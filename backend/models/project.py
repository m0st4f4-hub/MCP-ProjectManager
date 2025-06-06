"""
Project Model - MEGA-CONSOLIDATION Phase 4
Comprehensive project management with advanced relationships and validation
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index, JSON, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, validates
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid

Base = declarative_base()

class Project(Base):
    """Main Project Model with comprehensive features"""
    __tablename__ = 'projects'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(String(50), default='active', index=True)
    priority = Column(String(20), default='medium', index=True)
    
    # Advanced project metadata
    metadata_json = Column(JSONB, default={})
    tags = Column(JSONB, default=[])
    settings = Column(JSONB, default={})
    
    # Analytics and tracking
    view_count = Column(Integer, default=0)
    activity_score = Column(Numeric(10, 2), default=0.0)
    completion_percentage = Column(Numeric(5, 2), default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived_at = Column(DateTime, nullable=True)
    
    # Owner and access control
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'))
    visibility = Column(String(20), default='private', index=True)
    
    # Relationships
    owner = relationship("User", back_populates="owned_projects")
    team = relationship("Team", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    templates = relationship("ProjectTemplate", back_populates="project")
    audit_logs = relationship("AuditLog", back_populates="project")
    
    # Indexes
    __table_args__ = (
        Index('idx_projects_status_priority', 'status', 'priority'),
        Index('idx_projects_owner_created', 'owner_id', 'created_at'),
        Index('idx_projects_activity_score', 'activity_score'),
        Index('idx_projects_completion', 'completion_percentage'),
    )
    
    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['active', 'completed', 'paused', 'archived', 'cancelled']
        if status not in valid_statuses:
            raise ValueError(f"Invalid status: {status}")
        return status
    
    @validates('priority')
    def validate_priority(self, key, priority):
        valid_priorities = ['low', 'medium', 'high', 'critical']
        if priority not in valid_priorities:
            raise ValueError(f"Invalid priority: {priority}")
        return priority
    
    @validates('visibility')
    def validate_visibility(self, key, visibility):
        valid_visibility = ['private', 'team', 'public']
        if visibility not in valid_visibility:
            raise ValueError(f"Invalid visibility: {visibility}")
        return visibility
    
    def to_dict(self):
        """Convert project to dictionary"""
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'metadata': self.metadata_json,
            'tags': self.tags,
            'view_count': self.view_count,
            'activity_score': float(self.activity_score),
            'completion_percentage': float(self.completion_percentage),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'owner_id': str(self.owner_id),
            'team_id': str(self.team_id) if self.team_id else None,
            'visibility': self.visibility
        }
    
    def update_activity_score(self):
        """Calculate and update activity score based on recent tasks and interactions"""
        # Implementation would calculate based on task completions, recent updates, etc.
        pass
    
    def calculate_completion_percentage(self):
        """Calculate project completion based on task progress"""
        if not self.tasks:
            return 0.0
        
        completed_tasks = sum(1 for task in self.tasks if task.status == 'completed')
        return (completed_tasks / len(self.tasks)) * 100.0


class ProjectTemplate(Base):
    """Project Templates for standardized project creation"""
    __tablename__ = 'project_templates'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    template_data = Column(JSONB, nullable=False)
    category = Column(String(100), index=True)
    is_public = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Creator
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = relationship("User", back_populates="project_templates")
    project = relationship("Project", back_populates="templates")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'template_data': self.template_data,
            'category': self.category,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat(),
            'created_by': str(self.created_by)
        }
