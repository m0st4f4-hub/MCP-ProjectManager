"""
Consolidated models package.
All models imported here for easy access and to avoid circular imports.
"""

# Import base utilities first
from .base import (
    Base, BaseModel, JSONText, ProjectMemberRole, ArchivedMixin,
    generate_uuid, generate_uuid_with_hyphens
)

# Import foundational models
from .user import User, UserRole

# Import models that depend on foundational ones (or are core)
from .agent import Agent, AgentRule, AgentRole
from .comment import Comment
from .memory import MemoryEntity, MemoryObservation, MemoryRelation
from .project import Project, ProjectTemplate, ProjectMember, ProjectFileAssociation
from .task import Task, TaskStatus
from .task_relations import TaskDependency, TaskFileAssociation
from .workflow import Workflow, WorkflowStep, AgentPromptTemplate
from .audit import AuditLog, AgentRuleViolation, AgentBehaviorLog
from .universal_mandate import UniversalMandate

# Import agent capabilities and other related models (they exist in individual files)
from .agent_capability import AgentCapability
from .agent_forbidden_action import AgentForbiddenAction
from .agent_verification_requirement import AgentVerificationRequirement
from .agent_handoff_criteria import AgentHandoffCriteria
from .agent_error_protocol import AgentErrorProtocol

# Export all models
__all__ = [
    # Base utilities
    'Base', 'BaseModel', 'JSONText', 'ProjectMemberRole', 'ArchivedMixin',
    'generate_uuid', 'generate_uuid_with_hyphens',
    
    # Foundational models
    'User', 'UserRole',
    
    # Core models and those depending on foundational ones
    'Agent', 'AgentRule', 'AgentRole',
    'Comment',
    'MemoryEntity', 'MemoryObservation', 'MemoryRelation',
    'Project', 'ProjectTemplate', 'ProjectMember', 'ProjectFileAssociation',
    'Task', 'TaskStatus',
    'TaskDependency', 'TaskFileAssociation',
    'Workflow', 'WorkflowStep', 'AgentPromptTemplate',
    'AuditLog', 'AgentRuleViolation', 'AgentBehaviorLog',
    'UniversalMandate',
    
    # Agent Capabilities and related models
    'AgentCapability',
    'AgentForbiddenAction',
    'AgentVerificationRequirement',
    'AgentHandoffCriteria',
    'AgentErrorProtocol',
]
