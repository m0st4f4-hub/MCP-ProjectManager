"""
Schemas package - contains Pydantic models for API requests/responses.
"""
from datetime import datetime
from pydantic.json import ENCODERS_BY_TYPE

ENCODERS_BY_TYPE[datetime] = lambda v: v.isoformat()

# Import and export project schemas
from .project import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    Project,
    ProjectFileAssociationBase,
    ProjectFileAssociationCreate,
    ProjectFileAssociation,
    ProjectTemplateBase,
    ProjectTemplateCreate,
    ProjectTemplateUpdate,
    ProjectTemplate,
    ProjectMemberBase,
    ProjectMemberCreate,
    ProjectMemberUpdate,
    ProjectMember,
)

# Import and export user schemas  
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    User,
    UserRoleBase,
    UserRoleCreate,
    UserRoleUpdate,
    UserRole,
)

# Import and export task schemas
from .task import (
    TaskBase,
    TaskCreate,
    TaskUpdate,
    Task,
    TaskInDBBase,
    TaskInDB,
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

from .error_protocol import (
    ErrorProtocolBase,
    ErrorProtocolCreate,
    ErrorProtocolUpdate,
    ErrorProtocol,
)

