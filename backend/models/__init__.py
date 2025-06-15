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

# Core models only for now
from .project import Project, ProjectFileAssociation
from .task import Task, TaskStatus
from .comment import Comment
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

# Simple agent model
try:
    from .agent import Agent
except:
    # Create a minimal agent model if import fails
    from sqlalchemy import Column, String, Text
    class Agent(Base, BaseModel):
        __tablename__ = "agents"
        name = Column(String(255), nullable=False, unique=True)
        description = Column(Text, nullable=True)

# Simple audit model
from .audit import AuditLog

# Export essential models only
__all__ = [
    'Base',
    'BaseModel',
    'JSONText',
    'generate_uuid',
    'generate_uuid_with_hyphens',
    'ArchivedMixin',
    'Project',
    'Task',
    'TaskStatus',
    'Agent',
    'AuditLog',
    'Comment',
    'AgentRole',
    'AgentCapability',
    'AgentForbiddenAction',
    'AgentVerificationRequirement',
    'AgentHandoffCriteria',
    'AgentErrorProtocol',
    'AgentPromptTemplate',
    'UniversalMandate',
    'Workflow',
    'WorkflowStep',
    'ProjectFileAssociation',
    'ProjectTemplate',
    'MemoryEntity',
    'MemoryObservation',
    'MemoryRelation',
]