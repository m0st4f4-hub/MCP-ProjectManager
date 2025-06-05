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
    PaginationParams
)

# Rebuild models to resolve forward references
# This is typically handled by Pydantic v2 automatically if type hints are used correctly,
# but this explicit rebuild can be kept if necessary for compatibility or specific patterns.
# This part seems incomplete in the original code, so I'm commenting it out.
# You might need to add the actual model_rebuild() calls here if required.

# Agent.model_rebuild()
# AgentCreate.model_rebuild()
# AgentUpdate.model_rebuild()
# AgentRule.model_rebuild()
# AgentRuleCreate.model_rebuild()
# AgentRuleUpdate.model_rebuild()
# ... and so on for all models
