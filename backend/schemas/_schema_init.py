"""
Schema initialization to ensure proper type resolution for OpenAPI generation.
"""

# Import all schemas to ensure they're loaded and forward references can be resolved
from .agent import Agent, AgentCreate, AgentUpdate, AgentRule, AgentRuleCreate, AgentRuleUpdate
from .agent_role import AgentRole, AgentRoleCreate, AgentRoleUpdate
from .audit_log import AuditLog, AuditLogCreate
from .comment import Comment, CommentCreate, CommentUpdate
from .file_association import TaskFileAssociation, TaskFileAssociationCreate
from .memory import MemoryEntity, MemoryEntityCreate, MemoryEntityUpdate, MemoryObservation, MemoryObservationCreate, MemoryRelationCreate
from .project import Project, ProjectCreate, ProjectUpdate, ProjectMember, ProjectMemberCreate, ProjectMemberUpdate, ProjectFileAssociation, ProjectFileAssociationCreate
from .project_template import ProjectTemplate, ProjectTemplateCreate, ProjectTemplateUpdate
from .task import Task, TaskCreate, TaskUpdate, TaskInDBBase
from .task_dependency import TaskDependency, TaskDependencyCreate
from .task_status import TaskStatus, TaskStatusCreate, TaskStatusUpdate
from .user import User, UserCreate, UserUpdate, UserRole, UserRoleCreate
from .workflow import Workflow, WorkflowCreate, WorkflowUpdate
from .workflow_step import WorkflowStep, WorkflowStepCreate, WorkflowStepUpdate
from .api_responses import DataResponse, ListResponse, ErrorResponse, PaginationParams

# Rebuild models to resolve forward references
