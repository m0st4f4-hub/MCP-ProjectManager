"""
Models package for the task manager application - Simplified.
"""

from backend.database import Base
from .base import (
    BaseModel,
    JSONText,
    generate_uuid,
    generate_uuid_with_hyphens,
    ArchivedMixin
)

# Core models
from .project import Project, ProjectFileAssociation
from .task import Task, TaskStatus
from .comment import Comment
from .agent import Agent, AgentRule
from .agent_role import AgentRole
from .agent_capability import AgentCapability
from .agent_forbidden_action import AgentForbiddenAction
from .agent_verification_requirement import AgentVerificationRequirement
from .agent_handoff_criteria import AgentHandoffCriteria
from .agent_error_protocol import AgentErrorProtocol
from .agent_prompt_template import AgentPromptTemplate
from .universal_mandate import UniversalMandate
from .workflow import Workflow, WorkflowStep
from .project_template import ProjectTemplate
from .memory import MemoryEntity, MemoryObservation, MemoryRelation

# Enhanced models for Phase 1
from .file_asset import FileAsset, FileAssetTag, FileAssetTagAssociation, FileProcessingJob
from .agent_execution import TaskWorkflowExecution, TaskStatusTransition, AgentHandoffEvent, AgentPerformanceMetric
from .mcp_integration import MCPTool, MCPToolExecution, MCPToolMetric, MCPToolDependency
from .enums_tables import EnumRegistry, EnumValue, StatusTransitionRule

# Simple audit model
from .audit import AuditLog

# Export essential models only
__all__ = [
    # Base classes
    'Base',
    'BaseModel',
    'JSONText',
    'generate_uuid',
    'generate_uuid_with_hyphens',
    'ArchivedMixin',
    
    # Core models
    'Project',
    'ProjectFileAssociation',
    'Task',
    'TaskStatus',
    'Agent',
    'AgentRule',
    'AgentRole',
    'Comment',
    'AuditLog',
    
    # Agent system
    'AgentCapability',
    'AgentForbiddenAction',
    'AgentVerificationRequirement',
    'AgentHandoffCriteria',
    'AgentErrorProtocol',
    'AgentPromptTemplate',
    
    # Workflow and templates
    'Workflow',
    'WorkflowStep',
    'ProjectTemplate',
    'UniversalMandate',
    
    # Memory system
    'MemoryEntity',
    'MemoryObservation',
    'MemoryRelation',
    
    # Enhanced models (Phase 1)
    'FileAsset',
    'FileAssetTag', 
    'FileAssetTagAssociation',
    'FileProcessingJob',
    'TaskWorkflowExecution',
    'TaskStatusTransition',
    'AgentHandoffEvent',
    'AgentPerformanceMetric',
    'MCPTool',
    'MCPToolExecution',
    'MCPToolMetric',
    'MCPToolDependency',
    'EnumRegistry',
    'EnumValue',
    'StatusTransitionRule',
]