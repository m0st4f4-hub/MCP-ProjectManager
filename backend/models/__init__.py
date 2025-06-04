"""
Consolidated models package with all models and utilities available.
"""

# Import base utilities first
try:
    from ..database import Base
except ImportError:
    from database import Base

# Import essential base utilities and make them available
from .base import (
    BaseModel, 
    JSONText, 
    generate_uuid, 
    generate_uuid_with_hyphens,
    ArchivedMixin,
    ProjectMemberRole
)

# Import user and audit models
from .user import User, UserRole
from .audit import AuditLog

# Import memory models
from .memory import MemoryEntity, MemoryObservation, MemoryRelation

# Import core project models
from .project import Project, ProjectMember, ProjectFileAssociation

# Import task models
from .task import Task, TaskStatus

# Import agent models  
from .agent import Agent, AgentRule, AgentRole

# Import additional agent models
from .agent_capability import AgentCapability
from .agent_error_protocol import AgentErrorProtocol
from .agent_forbidden_action import AgentForbiddenAction
from .agent_handoff_criteria import AgentHandoffCriteria
from .agent_verification_requirement import AgentVerificationRequirement

# Import task-related models
from .task_dependency import TaskDependency
from .task_file_association import TaskFileAssociation

# Import comment model
from .comment import Comment

# Import additional models
from .project_template import ProjectTemplate
from .workflow import Workflow, WorkflowStep, AgentPromptTemplate
from .universal_mandate import UniversalMandate

# Export all available models and utilities
__all__ = [
    # Base utilities
    'Base',
    'BaseModel', 
    'JSONText',
    'generate_uuid',
    'generate_uuid_with_hyphens',
    'ArchivedMixin',
    'ProjectMemberRole',
    
    # Core models
    'User',
    'UserRole',
    'Project',
    'Task',
    'Agent',
    'Comment',
    
    # Project models
    'ProjectMember',
    'ProjectFileAssociation',
    'ProjectTemplate',
    
    # Task models
    'TaskStatus',
    'TaskDependency', 
    'TaskFileAssociation',
    
    # Agent models
    'AgentRule',
    'AgentRole',
    'AgentCapability',
    'AgentErrorProtocol',
    'AgentForbiddenAction',
    'AgentHandoffCriteria',
    'AgentVerificationRequirement',
    
    # Memory models
    'MemoryEntity',
    'MemoryObservation',
    'MemoryRelation',
    
    # Audit model
    'AuditLog',
    
    # Additional models
    'Workflow',
    'WorkflowStep',
    'AgentPromptTemplate',
    'UniversalMandate',
]
