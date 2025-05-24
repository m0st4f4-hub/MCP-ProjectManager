"""
Consolidated schemas package.
All schemas imported here for easy access and to avoid circular imports.
"""

# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

# This file makes the 'schemas' directory a Python package
# and exports everything from the schema modules to make them
# available at the package level (backend.schemas.XXX)

# Explicitly re-export schemas from schema modules to make them available at the package level

# Corrected import for base models
from backend.models.base import (
    Base, BaseModel, JSONText, ProjectMemberRole, ArchivedMixin,
    generate_uuid, generate_uuid_with_hyphens
)

# Import and re-export schemas from the memory module
from .memory import MemoryEntityCreate, MemoryEntityUpdate, MemoryObservationCreate, MemoryRelationCreate, MemoryEntity, MemoryObservation

# Import and re-export schemas from the agent module
from .agent import (
    AgentBase,
    AgentCreate,
    AgentUpdate,
    Agent,
    AgentRuleBase,
    AgentRuleCreate,
    AgentRuleUpdate,
    AgentRule
)

# Import and re-export schemas from the agent_role module
from .agent_role import (
    AgentRoleBase,
    AgentRoleCreate,
    AgentRoleUpdate,
    AgentRole
)

# Import and re-export schemas from the workflow module
from .workflow import (
    WorkflowBase,
    WorkflowCreate,
    WorkflowUpdate,
    Workflow
)

# Import and re-export schemas from the agent_prompt_template module
from .agent_prompt_template import (
    AgentPromptTemplateBase,
    AgentPromptTemplateCreate,
    AgentPromptTemplateUpdate,
    AgentPromptTemplate
)

# Import and re-export schemas from the agent_rule_violation module
from .agent_rule_violation import (
    AgentRuleViolationBase,
    AgentRuleViolationCreate,
    AgentRuleViolation
)

# Import and re-export schemas from the project module
from .project import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    Project,
    ProjectFileAssociationBase,
    ProjectFileAssociationCreate,
    ProjectFileAssociation,
    ProjectMemberBase,
    ProjectMemberCreate,
    ProjectMemberUpdate,
    ProjectMember
)

# Import and re-export schemas from the project_template module
from .project_template import (
    ProjectTemplateBase,
    ProjectTemplateCreate,
    ProjectTemplateUpdate,
    ProjectTemplate
)

# Import and re-export schemas from the task module
from .task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    TaskInDBBase,
    Task,
    TaskInDB
)

# Import and re-export schemas from the task_status module
from .task_status import (
    TaskStatusBase,
    TaskStatusCreate,
    TaskStatusUpdate,
    TaskStatus
)

# Import and re-export schemas from the audit_log module
from .audit_log import (
    AuditLogBase,
    AuditLogCreate,
    AuditLog
)

# Import and re-export schemas from the file_association module
from .file_association import (
    TaskFileAssociationBase,
    TaskFileAssociationCreate,
    TaskFileAssociation
)

# Import and re-export schemas from the task_dependency module
from .task_dependency import (
    TaskDependencyBase,
    TaskDependencyCreate,
    TaskDependency
)

# Import and re-export schemas from the comment module
from .comment import (
    CommentBase,
    CommentCreate,
    CommentUpdate,
    Comment
)

# Import and re-export schemas from the user module
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    User,
    UserRoleBase,
    UserRoleCreate,
    UserRole
)

# Import and re-export schemas from the universal_mandate module
from .universal_mandate import (
    UniversalMandateBase,
    UniversalMandateCreate,
    UniversalMandateUpdate,
    UniversalMandate
)

# Import agent capabilities and other related schemas (they exist in individual files)
from backend.models.agent_capability import AgentCapability
from backend.models.agent_forbidden_action import AgentForbiddenAction
from backend.models.agent_verification_requirement import AgentVerificationRequirement
from backend.models.agent_handoff_criteria import AgentHandoffCriteria
from backend.models.agent_error_protocol import AgentErrorProtocol
from .agent_behavior_log import AgentBehaviorLogCreate, AgentBehaviorLog

# Explicitly define __all__ to control what is imported with `from backend.schemas import *`
__all__ = [
    # Base utilities
    'Base',
    'BaseModel',
    'JSONText',
    'ProjectMemberRole',
    'ArchivedMixin',
    'generate_uuid',
    'generate_uuid_with_hyphens',

    # Core models (these are likely schemas, the naming is a bit inconsistent)
    'User',
    'UserRole',
    'Comment',
    'Agent',
    'AgentRule',
    'AgentRole',
    'Project',
    'ProjectTemplate',
    'ProjectMember',
    'ProjectFileAssociation',
    'Task',
    'TaskStatus',
    'TaskDependency',
    'TaskFileAssociation',
    'Workflow',
    'WorkflowStep',
    'AgentPromptTemplate',
    'AuditLog',
    'MemoryEntity',
    'MemoryObservation',
    'MemoryRelation',
    'UniversalMandate',

    # Agent Capabilities and related models/schemas
    'AgentCapability',
    'AgentForbiddenAction',
    'AgentVerificationRequirement',
    'AgentHandoffCriteria',
    'AgentErrorProtocol',
    'AgentBehaviorLogCreate',
    'AgentBehaviorLog',

    # Schemas with specific names
    'MemoryEntityCreate',
    'MemoryEntityUpdate',
    'MemoryObservationCreate',
    'MemoryRelationCreate',
    'AgentBase',
    'AgentCreate',
    'AgentUpdate',
    'AgentRuleBase',
    'AgentRuleCreate',
    'AgentRuleUpdate',
    'AgentRoleBase',
    'AgentRoleCreate',
    'AgentRoleUpdate',
    'WorkflowBase',
    'WorkflowCreate',
    'WorkflowUpdate',
    'AgentPromptTemplateBase',
    'AgentPromptTemplateCreate',
    'AgentPromptTemplateUpdate',
    'AgentRuleViolationBase',
    'AgentRuleViolationCreate',
    'AgentRuleViolation',
    'ProjectBase',
    'ProjectCreate',
    'ProjectUpdate',
    'ProjectFileAssociationBase',
    'ProjectFileAssociationCreate',
    'ProjectMemberBase',
    'ProjectMemberCreate',
    'ProjectMemberUpdate',
    'ProjectTemplateBase',
    'ProjectTemplateCreate',
    'ProjectTemplateUpdate',
    'TaskBase',
    'TaskCreate',
    'TaskUpdate',
    'TaskInDBBase',
    'TaskInDB',
    'TaskStatusBase',
    'TaskStatusCreate',
    'TaskStatusUpdate',
    'AuditLogBase',
    'AuditLogCreate',
    'TaskFileAssociationBase',
    'TaskFileAssociationCreate',
    'TaskDependencyBase',
    'TaskDependencyCreate',
    'CommentBase',
    'CommentCreate',
    'CommentUpdate',
    'UserBase',
    'UserCreate',
    'UserUpdate',
    'UserRoleBase',
    'UserRoleCreate',
    'UserRole',
    'UniversalMandateBase',
    'UniversalMandateCreate',
    'UniversalMandateUpdate',
]