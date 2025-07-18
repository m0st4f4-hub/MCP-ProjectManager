"""Schemas package - contains Pydantic models for API requests/responses."""
# flake8: noqa

# Import and export project schemas
from .project import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    Project,
)

# Import project template schemas
from .project_template import (
    ProjectTemplateBase,
    ProjectTemplateCreate,
    ProjectTemplateUpdate,
    ProjectTemplate,
)

# Import file association schemas
from .file_association import (
    TaskFileAssociationBase,
    TaskFileAssociationCreate,
    TaskFileAssociation,
)

# User schemas removed for single-user mode

# Import comment schemas
from .comment import (
    CommentBase,
    CommentCreate,
    CommentUpdate,
    Comment,
)

# Import API response schemas
from .api_responses import (
    DataResponse,
    ListResponse,
    ErrorResponse,
    PaginationParams,
)

# Import agent role schemas
from .agent_role import (
    AgentRoleBase,
    AgentRoleCreate,
    AgentRoleUpdate,
    AgentRole,
)

# Import and export task schemas
from .task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    Task,
)

# Import and export task dependency schemas
from .task_dependency import (
    TaskDependencyBase,
    TaskDependencyCreate,
    TaskDependency,
)

# Import and export agent schemas
from .agent import (
    AgentBase,
    AgentCreate,
    AgentUpdate,
    Agent,
    AgentRuleBase,
    AgentRuleCreate,
    AgentRuleUpdate,
    AgentRule,
)
from .agent_forbidden_action import (
    AgentForbiddenActionBase,
    AgentForbiddenActionCreate,
    AgentForbiddenAction,
)

# Import and export memory schemas
from .memory import (
    MemoryEntityBase,
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryEntity,
    MemoryObservationBase,
    MemoryObservationCreate,
    MemoryObservation,
    MemoryRelationBase,
    MemoryRelationCreate,
    MemoryRelation,
)

from .agent_handoff_criteria import (
    AgentHandoffCriteriaBase,
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteria,
    AgentHandoffCriteriaUpdate,
)

from .agent_error_protocol import (
    AgentErrorProtocolBase,
    AgentErrorProtocolCreate,
    AgentErrorProtocolUpdate,
    AgentErrorProtocol,
)

from .agent_verification_requirement import (
    AgentVerificationRequirementBase,
    AgentVerificationRequirementCreate,
    AgentVerificationRequirement,
)

from .file_ingest import FileIngestInput

# Import error protocol schemas
from .error_protocol import (
    ErrorProtocolBase,
    ErrorProtocolCreate,
    ErrorProtocolUpdate,
    ErrorProtocol,
)
