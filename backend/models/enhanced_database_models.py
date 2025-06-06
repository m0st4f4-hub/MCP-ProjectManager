"""
Enhanced Database Models for MEGA-CONSOLIDATION Phase 4
Consolidates multiple PRs related to database schema, models, and relationships
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index, JSON, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, validates
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid

Base = declarative_base()

class EnhancedProjectModel(Base):
    """Enhanced Project Model with advanced relationships and validation"""
    __tablename__ = 'projects_enhanced'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(String(50), default='active', index=True)
    metadata = Column(JSONB, default={})
    priority = Column(Integer, default=1, index=True)
    
    # Enhanced timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = Column(DateTime, nullable=True, index=True)
    
    # Advanced relationships
    tasks = relationship("EnhancedTaskModel", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("EnhancedAuditLogModel", back_populates="project")
    
    # Database indexes for performance
    __table_args__ = (
        Index('idx_project_status_priority', 'status', 'priority'),
        Index('idx_project_created_deadline', 'created_at', 'deadline'),
    )
    
    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['active', 'completed', 'paused', 'archived']
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of: {valid_statuses}")
        return status

class EnhancedTaskModel(Base):
    """Enhanced Task Model with advanced tracking and relationships"""
    __tablename__ = 'tasks_enhanced'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text)
    status = Column(String(50), default='pending', index=True)
    priority = Column(Integer, default=1, index=True)
    
    # Advanced tracking
    estimated_hours = Column(Numeric(5, 2), nullable=True)
    actual_hours = Column(Numeric(5, 2), nullable=True)
    completion_percentage = Column(Integer, default=0)
    
    # Enhanced relationships
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects_enhanced.id'), nullable=False, index=True)
    project = relationship("EnhancedProjectModel", back_populates="tasks")
    
    # Dependencies and relationships
    dependencies = relationship("TaskDependencyModel", foreign_keys="TaskDependencyModel.task_id")
    dependents = relationship("TaskDependencyModel", foreign_keys="TaskDependencyModel.depends_on_id")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(DateTime, nullable=True, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Additional metadata
    tags = Column(JSONB, default=[])
    custom_fields = Column(JSONB, default={})
    
    __table_args__ = (
        Index('idx_task_project_status', 'project_id', 'status'),
        Index('idx_task_priority_due', 'priority', 'due_date'),
    )

class TaskDependencyModel(Base):
    """Task dependency relationships"""
    __tablename__ = 'task_dependencies'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey('tasks_enhanced.id'), nullable=False)
    depends_on_id = Column(UUID(as_uuid=True), ForeignKey('tasks_enhanced.id'), nullable=False)
    dependency_type = Column(String(50), default='blocks')  # blocks, related, subtask
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_dependency_task', 'task_id'),
        Index('idx_dependency_depends_on', 'depends_on_id'),
    )

class EnhancedAuditLogModel(Base):
    """Enhanced Audit Log with comprehensive tracking"""
    __tablename__ = 'audit_logs_enhanced'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(100), nullable=False, index=True)
    
    # Enhanced audit data
    old_values = Column(JSONB, default={})
    new_values = Column(JSONB, default={})
    changes_summary = Column(Text)
    
    # Context information
    user_id = Column(String(100), nullable=True, index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    session_id = Column(String(100), index=True)
    
    # Relationships
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects_enhanced.id'), nullable=True, index=True)
    project = relationship("EnhancedProjectModel", back_populates="audit_logs")
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        Index('idx_audit_entity', 'entity_type', 'entity_id'),
        Index('idx_audit_user_time', 'user_id', 'timestamp'),
        Index('idx_audit_action_time', 'action', 'timestamp'),
    )

class EnhancedAgentModel(Base):
    """Enhanced Agent Model with capabilities and performance tracking"""
    __tablename__ = 'agents_enhanced'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default='active', index=True)
    
    # Agent capabilities and configuration
    capabilities = Column(JSONB, default=[])
    configuration = Column(JSONB, default={})
    version = Column(String(50))
    
    # Performance metrics
    tasks_completed = Column(Integer, default=0)
    success_rate = Column(Numeric(5, 2), default=0.0)
    average_completion_time = Column(Numeric(10, 2), default=0.0)
    
    # Resource usage
    last_active = Column(DateTime, nullable=True, index=True)
    total_runtime_hours = Column(Numeric(10, 2), default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_agent_type_status', 'type', 'status'),
        Index('idx_agent_performance', 'success_rate', 'tasks_completed'),
    )

class VerificationRequirementModel(Base):
    """Verification Requirements for enhanced quality control"""
    __tablename__ = 'verification_requirements'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    requirement_type = Column(String(50), nullable=False, index=True)
    
    # Verification rules
    rules = Column(JSONB, default={})
    acceptance_criteria = Column(JSONB, default=[])
    tools_required = Column(JSONB, default=[])
    
    # Status and tracking
    is_active = Column(Boolean, default=True, index=True)
    priority = Column(Integer, default=1, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_verification_type_active', 'requirement_type', 'is_active'),
    )

class MemoryRelationModel(Base):
    """Memory Relations for agent knowledge management"""
    __tablename__ = 'memory_relations'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_id = Column(String(100), nullable=False, index=True)
    target_entity_id = Column(String(100), nullable=False, index=True)
    relation_type = Column(String(50), nullable=False, index=True)
    
    # Relation metadata
    strength = Column(Numeric(3, 2), default=1.0)  # 0.0 to 1.0
    context = Column(JSONB, default={})
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_memory_source_target', 'source_entity_id', 'target_entity_id'),
        Index('idx_memory_relation_type', 'relation_type', 'strength'),
    )
"""