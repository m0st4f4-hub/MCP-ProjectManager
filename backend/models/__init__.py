"""
Consolidated models package.
All models imported here for easy access and to avoid circular imports.
"""

# Import base utilities first
from .base import (
    Base, BaseModel, JSONText, ProjectMemberRole, ArchivedMixin,
    generate_uuid, generate_uuid_with_hyphens
)

# Import core models
from .user import User, UserRole
# from .comment import Comment
# from .agent import Agent, AgentRule, AgentRole
from .project import Project, ProjectMember #, ProjectTemplate, ProjectFileAssociation # Keep project for now as it was working in isolation
# from .task import Task, TaskStatus
# from .task_relations import TaskDependency, TaskFileAssociation
# from .workflow import Workflow, WorkflowStep, AgentPromptTemplate
# from .audit import AuditLog, AgentRuleViolation, AgentBehaviorLog
# from .memory import MemoryEntity, MemoryObservation, MemoryRelation
# from .universal_mandate import UniversalMandate

# Import agent capabilities and other related models (they exist in individual files)
# from .agent_capability import AgentCapability
# from .agent_forbidden_action import AgentForbiddenAction
# from .agent_verification_requirement import AgentVerificationRequirement
# from .agent_handoff_criteria import AgentHandoffCriteria
# from .agent_error_protocol import AgentErrorProtocol

# Export all models
__all__ = [
    # Base utilities
    'Base', 'BaseModel', 'JSONText', 'ProjectMemberRole', 'ArchivedMixin',
    'generate_uuid', 'generate_uuid_with_hyphens',
    
    # Core models
    'User', 'UserRole',
    # 'Comment',
    
    # Agent models
    # 'Agent', 'AgentRule', 'AgentRole',
    
    # Project models
    'Project', 'ProjectMember', # 'ProjectTemplate', 'ProjectFileAssociation',
    
    # Task models
    # 'Task', 'TaskStatus', 'TaskDependency', 'TaskFileAssociation',
    
    # Workflow models
    # 'Workflow', 'WorkflowStep', 'AgentPromptTemplate',
    
    # Audit models
    # 'AuditLog', 'AgentRuleViolation', 'AgentBehaviorLog',
    
    # Memory models
    # 'MemoryEntity', 'MemoryObservation', 'MemoryRelation',
    
    # Universal Mandate
    # 'UniversalMandate',
    
    # Agent Capabilities and related models
    # 'AgentCapability',
    # 'AgentForbiddenAction',
    # 'AgentVerificationRequirement',
    # 'AgentHandoffCriteria',
    # 'AgentErrorProtocol',
]
