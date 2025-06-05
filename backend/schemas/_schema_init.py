"""
Schema initialization to ensure proper type resolution for OpenAPI generation.
"""

# Import all schemas to ensure they're loaded and forward references can be resolved
from .agent import (  # noqa: F401
    Agent,
    AgentCreate,
    AgentUpdate,
    AgentRule,
    AgentRuleCreate,
    AgentRuleUpdate
)
from .memory import (  # noqa: F401
    MemoryEntity,
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservation,
    MemoryObservationCreate,
    MemoryRelationCreate
)
from .project import (  # noqa: F401
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectMember,
    ProjectMemberCreate,
    ProjectMemberUpdate,
    ProjectFileAssociation,
    ProjectFileAssociationCreate
)
from .agent_handoff_criteria import (  # noqa: F401
    AgentHandoffCriteria,
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteriaUpdate,
)
from .project_template import (  # noqa: F401
    ProjectTemplate,
    ProjectTemplateCreate,
    ProjectTemplateUpdate
)
from .api_responses import (  # noqa: F401
    DataResponse,
    ListResponse,
    ErrorResponse,
    PaginationParams,
)

# Rebuild models to resolve forward references
_SCHEMAS = [
    Agent,
    AgentCreate,
    AgentUpdate,
    AgentRule,
    AgentRuleCreate,
    AgentRuleUpdate,
    MemoryEntity,
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservation,
    MemoryObservationCreate,
    MemoryRelationCreate,
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectMember,
    ProjectMemberCreate,
    ProjectMemberUpdate,
    ProjectFileAssociation,
    ProjectFileAssociationCreate,
    AgentHandoffCriteria,
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteriaUpdate,
    ProjectTemplate,
    ProjectTemplateCreate,
    ProjectTemplateUpdate,
    DataResponse,
    ListResponse,
    ErrorResponse,
    PaginationParams,
]

for schema in _SCHEMAS:
    schema.model_rebuild()
