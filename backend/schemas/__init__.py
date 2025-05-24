"""
Consolidated schemas package.
Removed explicit imports and __all__ to break circular dependencies.
Individual files should import schemas directly.
"""

# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

# This file makes the 'schemas' directory a Python package
# and used to export everything from the schema modules.
# Explicit re-exporting has been removed to fix circular imports.

# Remove all specific imports and the __all__ list
# from backend.models.base import (
#     Base, BaseModel as SQLABaseModel, JSONText, ProjectMemberRole, ArchivedMixin,
#     generate_uuid, generate_uuid_with_hyphens
# )
# from pydantic import BaseModel # Ensure Pydantic's BaseModel is also available

# # Import and re-export schemas from the memory module
# from .memory import MemoryEntityCreate, MemoryEntityUpdate, MemoryObservationCreate, MemoryRelationCreate, MemoryEntity, MemoryObservation

# # Import and re-export schemas from the agent module
# from .agent import (
#     AgentBase,
#     AgentCreate,
#     AgentUpdate,
#     Agent,
#     AgentRuleBase,
#     AgentRuleCreate,
#     AgentRuleUpdate,
#     AgentRule
# )

# # Import and re-export schemas from the agent_role module
# from .agent_role import (
#     AgentRoleBase,
#     AgentRoleCreate,
#     AgentRoleUpdate,
#     AgentRole
# )

# # Import and re-export schemas from the workflow module
# from .workflow import (
#     WorkflowBase,
#     WorkflowCreate,
#     WorkflowUpdate,
#     Workflow
# )

# # Import and re-export schemas from the workflow_step module
# from .workflow_step import (
#     WorkflowStepBase,
#     WorkflowStepCreate,
#     WorkflowStepUpdate,
#     WorkflowStep
# )

# # Import and re-export schemas from the agent_prompt_template module
# from .agent_prompt_template import (
#     AgentPromptTemplateBase,
#     AgentPromptTemplateCreate,
#     AgentPromptTemplateUpdate,
#     AgentPromptTemplate
# )

# # Import and re-export schemas from the agent_rule_violation module
# from .agent_rule_violation import (
#     AgentRuleViolationBase,
#     AgentRuleViolationCreate,
#     AgentRuleViolation
# )

# # Import and re-export schemas from the project module
# from .project import (
#     ProjectBase,
#     ProjectCreate,
#     ProjectUpdate,
#     Project,
#     ProjectFileAssociationBase,
#     ProjectFileAssociationCreate,
#     ProjectFileAssociation,
#     ProjectMemberBase,
#     ProjectMemberCreate,
#     ProjectMemberUpdate,
#     ProjectMember
# )

# # Import and re-export schemas from the project_template module
# from .project_template import (
#     ProjectTemplateBase,
#     ProjectTemplateCreate,
#     ProjectTemplateUpdate,
#     ProjectTemplate
# )

# # Import and re-export schemas from the task module
# from .task import (
#     TaskBase,
#     TaskCreate,
#     TaskUpdate,
#     TaskInDBBase,
#     Task,
#     TaskInDB
# )

# # Import and re-export schemas from the task_status module
# from .task_status import (
#     TaskStatusBase,
#     TaskStatusCreate,
#     TaskStatusUpdate,
#     TaskStatus
# )

# # Import and re-export schemas from the audit_log module
# from .audit_log import (
#     AuditLogBase,
#     AuditLogCreate,
#     AuditLog
# )

# # Import and re-export schemas from the file_association module
# from .file_association import (
#     TaskFileAssociationBase,
#     TaskFileAssociationCreate,
#     TaskFileAssociation
# )

# # Import and re-export schemas from the task_dependency module
# from .task_dependency import (
#     TaskDependencyBase,
#     TaskDependencyCreate,
#     TaskDependency
# )

# # Import and re-export schemas from the comment module
# from .comment import (
#     CommentBase,
#     CommentCreate,
#     CommentUpdate,
#     Comment
# )

# # Import and re-export schemas from the user module
# from .user import (
#     UserBase,
#     UserCreate,
#     UserUpdate,
#     User,
#     UserRoleBase,
#     UserRoleCreate,
#     UserRole
# )

# # Import and re-export schemas from the universal_mandate module
# from .universal_mandate import (
#     UniversalMandateBase,
#     UniversalMandateCreate,
#     UniversalMandateUpdate,
#     UniversalMandate
# )

# # Import agent capabilities and other related models (they exist in individual files)
# # These are models, not schemas, so they should not be imported here if we are keeping schemas and models separate.
# # from backend.models.agent_capability import AgentCapability
# # from backend.models.agent_forbidden_action import AgentForbiddenAction
# # from backend.models.agent_verification_requirement import AgentVerificationRequirement
# # from backend.models.agent_handoff_criteria import AgentHandoffCriteria
# # from backend.models.agent_error_protocol import AgentErrorProtocol
# from .agent_behavior_log import AgentBehaviorLogCreate, AgentBehaviorLog

# # Explicitly define __all__ to control what is imported with `from backend.schemas import *`
# __all__ = [
#     # Base utilities
#     'Base', # From backend.models.base
#     'SQLABaseModel', # Renamed from backend.models.base.BaseModel
#     'BaseModel', # From Pydantic
#     'JSONText',
#     'ProjectMemberRole',
#     'ArchivedMixin',
#     'generate_uuid',
#     'generate_uuid_with_hyphens',

#     # Core models (these are likely schemas, the naming is a bit inconsistent)
#     'User',
#     'UserBase',
#     'UserCreate',
#     'UserUpdate',
#     'UserRole',
#     'UserRoleBase',
#     'UserRoleCreate',
#     'Comment',
#     'CommentBase',
#     'CommentCreate',
#     'CommentUpdate',
#     'Agent',
#     'AgentBase',
#     'AgentCreate',
#     'AgentUpdate',
#     'AgentRule',
#     'AgentRuleBase',
#     'AgentRuleCreate',
#     'AgentRuleUpdate',
#     'AgentRole',
#     'AgentRoleBase',
#     'AgentRoleCreate',
#     'AgentRoleUpdate',
#     'Project',
#     'ProjectBase',
#     'ProjectCreate',
#     'ProjectUpdate',
#     'ProjectTemplate',
#     'ProjectTemplateBase',
#     'ProjectTemplateCreate',
#     'ProjectTemplateUpdate',
#     'ProjectMember',
#     'ProjectMemberBase',
#     'ProjectMemberCreate',
#     'ProjectMemberUpdate',
#     'ProjectFileAssociation',
#     'ProjectFileAssociationBase',
#     'ProjectFileAssociationCreate',
#     'Task',
#     'TaskBase',
#     'TaskCreate',
#     'TaskUpdate',
#     'TaskInDBBase',
#     'TaskInDB',
#     'TaskStatus',
#     'TaskStatusBase',
#     'TaskStatusCreate',
#     'TaskStatusUpdate',
#     'TaskDependency',
#     'TaskDependencyBase',
#     'TaskDependencyCreate',
#     'TaskFileAssociation',
#     'TaskFileAssociationBase',
#     'TaskFileAssociationCreate',
#     'Workflow',
#     'WorkflowBase',
#     'WorkflowCreate',
#     'WorkflowUpdate',
#     'WorkflowStep',
#     'AgentPromptTemplate',
#     'AgentPromptTemplateBase',
#     'AgentPromptTemplateCreate',
#     'AgentPromptTemplateUpdate',
#     'AuditLog',
#     'AuditLogBase',
#     'AuditLogCreate',
#     'MemoryEntity',
#     'MemoryEntityCreate',
#     'MemoryEntityUpdate',
#     'MemoryObservation',
#     'MemoryObservationCreate',
#     'MemoryRelationCreate',
#     'UniversalMandate',
#     'UniversalMandateBase',
#     'UniversalMandateCreate',
#     'UniversalMandateUpdate',

#     # Agent Capabilities and related models/schemas
#     # 'AgentCapability',
#     # 'AgentForbiddenAction',
#     # 'AgentVerificationRequirement',
#     # 'AgentHandoffCriteria',
#     # 'AgentErrorProtocol',
#     'AgentBehaviorLogCreate',
#     'AgentBehaviorLog',
#     'AgentRuleViolationBase',
#     'AgentRuleViolationCreate',
#     'AgentRuleViolation',

# ]