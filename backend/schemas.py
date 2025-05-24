from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Union, Any, Dict
from datetime import datetime
from pydantic import field_validator

# Defines Pydantic schemas for data validation and serialization.
#
# These schemas are used by FastAPI endpoints to validate incoming request data
# and to shape the structure of outgoing response data. They often correspond
# to the SQLAlchemy models defined in `models.py` but provide the API interface.


# --- Agent Schemas ---
class AgentBase(BaseModel):
    """Base schema for agent attributes."""
    name: str = Field(..., description="The unique name of the agent.")


class AgentCreate(AgentBase):
    """Schema for creating a new agent. Inherits attributes from AgentBase."""
    pass


# Schema for updating an agent (all fields optional)
class AgentUpdate(BaseModel):
    """Schema for updating an existing agent. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the agent.")


class Agent(AgentBase):
    """Schema for representing an agent in API responses (read operations)."""
    id: str = Field(..., description="Unique identifier for the agent.")
    created_at: datetime = Field(...,
                                 description="Timestamp when the agent was created.")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the agent was last updated.")

    model_config = ConfigDict(from_attributes=True)


# --- Agent Rule Definition Schemas (based on models.AgentRule table) ---
class AgentRuleBase(BaseModel):
    """Base schema for agent rule attributes.
    Corresponds to the fields in the 'agent_rules' table.
    """
    agent_id: str = Field(..., description="ID of the agent this rule is associated with.")
    rule_type: str = Field(..., description="Type of the rule (e.g., 'constraint', 'guideline').")
    rule_content: str = Field(..., description="The actual content/text of the rule.")
    is_active: bool = Field(True, description="Whether the rule is currently active.")

class AgentRuleCreate(AgentRuleBase):
    """Schema for creating a new agent rule.
    Used by crud.agent_rules.
    """
    pass

class AgentRuleUpdate(BaseModel):
    """Schema for updating an existing agent rule.
    All fields are optional. Used by crud.agent_rules.
    """
    agent_id: Optional[str] = Field(None, description="New agent ID for the rule.")
    rule_type: Optional[str] = Field(None, description="New type for the rule.")
    rule_content: Optional[str] = Field(None, description="New content for the rule.")
    is_active: Optional[bool] = Field(None, description="New active status for the rule.")

class AgentRule(AgentRuleBase):
    """Schema for representing an agent rule in API responses (includes ID)."""
    id: str = Field(..., description="Unique identifier for the agent rule.")
    # agent: Optional[Agent] = None # If you want to nest the agent object
    model_config = ConfigDict(from_attributes=True)


# --- Project Schemas ---
class ProjectBase(BaseModel):
    """Base schema for project attributes."""
    name: str = Field(..., description="The unique name of the project.")
    description: Optional[str] = Field(
        None, description="Optional text description of the project.")
    is_archived: bool = Field(
        False, description="Whether the project is archived.")


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


# Schema for updating a project (all fields optional)
class ProjectUpdate(BaseModel):
    """Schema for updating an existing project. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the project.")
    description: Optional[str] = Field(
        None, description="New description for the project.")
    is_archived: Optional[bool] = Field(
        None, description="Set the archived status of the project.")


class Project(ProjectBase):
    """Schema for representing a project in API responses."""
    id: str = Field(..., description="Unique identifier for the project.")
    created_at: datetime = Field(...,
                                 description="Timestamp when the project was created.")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the project was last updated.")
    task_count: int = Field(
        0, description="Number of tasks associated with this project.")
    # is_archived is inherited from ProjectBase
    model_config = ConfigDict(from_attributes=True)


# --- Project File Association Schemas ---
class ProjectFileAssociationBase(BaseModel):
    """Base schema for project-file association attributes."""
    project_id: str = Field(..., description="The ID of the associated project.")
    file_memory_entity_name: str = Field(..., description="The name/path of the associated file MemoryEntity.")


class ProjectFileAssociationCreate(ProjectFileAssociationBase):
    pass


class ProjectFileAssociation(ProjectFileAssociationBase):
    model_config = ConfigDict(from_attributes=True)


# --- Task Schemas (Updated) ---

# Base model for common attributes
class TaskBase(BaseModel):
    """Base schema for task attributes."""
    title: str
    description: Optional[str] = None
    status: Optional[str] = "To Do"
    is_archived: Optional[bool] = False


# Model for creating a task (inherits from Base, specific for creation)
class TaskCreate(TaskBase):
    """Schema used for creating a new task.
    Allows specifying agent by name for convenience during creation.
    """
    project_id: str = Field(...,
                            description="ID of the project this task belongs to.")
    agent_name: Optional[str] = Field(
        None, description="Name of the agent to assign (alternative to agent_id).")


# Model for updating a task (all fields optional)
class TaskUpdate(TaskBase):
    """Schema for updating an existing task. All fields are optional."""
    project_id: Optional[str] = Field(
        None, description="New project ID for the task.")
    agent_id: Optional[str] = Field(
        None, description="New agent ID for the task.")
    is_archived: Optional[bool] = Field(
        None, description="Set the archived status of the task.")


# --- Full Schemas (Output/Read) ---
# Configure models to work with ORM
# Note: OrmConfig class is not used directly here, config applied individually.
# class OrmConfig(BaseModel):
#     model_config = ConfigDict(from_attributes=True)


class TaskInDBBase(TaskBase):
    project_id: str
    task_number: int
    agent_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class Task(TaskInDBBase):
    """Schema for representing a task in API responses, including relationships."""
    project: Optional[Project] = Field(
        None, description="The project this task belongs to (populated from ORM).")
    agent: Optional[Agent] = Field(
        None, description="The agent assigned to this task (populated from ORM).")
    model_config = ConfigDict(from_attributes=True)


class TaskInDB(TaskInDBBase):
    pass


# Rebuild models to resolve forward references for relationships
# This is crucial if you have List['ModelName'] type hints in your schemas
# that are part of relationships.
Project.model_rebuild()
Agent.model_rebuild()
Task.model_rebuild()  # Task now refers to the consolidated Subtask


# --- Audit Log Schemas ---
class AuditLogBase(BaseModel):
    """Base schema for audit log attributes."""
    action: str = Field(..., description="The action performed.")
    user_id: Optional[str] = Field(
        None, description="The ID of the user who performed the action (if applicable).")
    details: Optional[dict] = Field(
        None, description="Optional details about the action (e.g., changes)."
    )
    entity_type: str = Field(..., description="The type of the entity affected.")
    entity_id: str = Field(..., description="The ID of the entity affected.")


class AuditLogCreate(AuditLogBase):
    """Schema for creating a new audit log entry."
    The timestamp should be generated by the server, not provided by the client.
    """
    pass


class AuditLog(AuditLogBase):
    """Schema for representing an audit log entry in API responses."""
    id: str = Field(...,
                    description="Unique identifier for the audit log entry.")

    model_config = ConfigDict(from_attributes=True)


# --- Task File Association Schemas ---
class TaskFileAssociationBase(BaseModel):
    """Base schema for task-file association attributes."""
    task_project_id: str = Field(..., description="The project ID of the associated task.")
    task_task_number: int = Field(..., description="The task number within the project.")
    file_memory_entity_name: str = Field(..., description="The name/path of the associated file MemoryEntity.")


class TaskFileAssociationCreate(TaskFileAssociationBase):
    pass


class TaskFileAssociation(TaskFileAssociationBase):
    model_config = ConfigDict(from_attributes=True)


# --- Task Dependency Schemas ---
class TaskDependencyBase(BaseModel):
    """Base schema for task dependency attributes."""
    predecessor_project_id: str = Field(
        ..., description="The project ID of the predecessor task.")
    predecessor_task_number: int = Field(
        ..., description="The task number of the predecessor task.")
    successor_project_id: str = Field(
        ..., description="The project ID of the successor task.")
    successor_task_number: int = Field(
        ..., description="The task number of the successor task.")
    type: str = Field(
        ..., description="Type of dependency (e.g., 'finishes_to_start').")


class TaskDependencyCreate(TaskDependencyBase):
    """Schema for creating a new task dependency."""
    pass  # All fields directly from base for creation


class TaskDependency(TaskDependencyBase):
    """Schema for representing a task dependency in API responses."""
    # Depending on the model structure, you might include IDs for the association record itself
    # Or related task objects (using forward references if needed and model_rebuild)
    model_config = ConfigDict(from_attributes=True)


# --- Comment Schemas ---
class CommentBase(BaseModel):
    """Base schema for comment attributes."""
    content: str = Field(..., description="The content of the comment.")
    author_id: Optional[str] = Field(
        None, description="The ID of the comment author (if linked to a user).") # Made optional

class CommentCreate(CommentBase):
    """Schema for creating a new comment."""
    # Optional task or project association during creation
    task_project_id: Optional[str] = Field(
        None, description="Project ID of the task this comment is on.")
    task_task_number: Optional[int] = Field(
        None, description="Task number this comment is on.")
    project_id: Optional[str] = Field(
        None, description="Project ID this comment is on (if not on a task).")

    @field_validator('task_project_id', 'task_task_number')
    def validate_task_association(cls, v, info):
        values = info.data
        if v is not None and values.get('project_id') is not None:
            raise ValueError("Cannot associate a comment with both a task and a project.")
        if (values.get('task_project_id') is None and values.get('task_task_number') is not None) or \
           (values.get('task_project_id') is not None and values.get('task_task_number') is None):
             raise ValueError("Both task_project_id and task_task_number must be provided for task association.")
        return v

    @field_validator('project_id')
    def validate_project_association(cls, v, info):
        values = info.data
        if v is not None and (values.get('task_project_id') is not None or values.get('task_task_number') is not None):
             raise ValueError("Cannot associate a comment with both a project and a task.")
        return v


class CommentUpdate(BaseModel):
    """Schema for updating an existing comment."""
    content: Optional[str] = Field(None, description="New content for the comment.")
    # Association fields are typically not updated via this schema, as comments are tied to their entity upon creation.


class Comment(CommentBase):
    """Schema for representing a comment in API responses."""
    id: str = Field(..., description="Unique identifier for the comment.")
    created_at: datetime = Field(...,
                                 description="Timestamp when the comment was created.")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the comment was last updated.")

    # Include related entity IDs in the response schema
    task_project_id: Optional[str] = Field(
        None, description="Project ID of the task this comment is on.")
    task_task_number: Optional[int] = Field(
        None, description="Task number this comment is on.")
    project_id: Optional[str] = Field(
        None, description="Project ID this comment is on.")

    # Optional relationships (can be loaded with joinedload if needed)
    # task: Optional[Task] = None
    # project: Optional[Project] = None
    # author: Optional[User] = None # To include author details

    model_config = ConfigDict(from_attributes=True)


# --- User Schemas ---
class UserBase(BaseModel):
    """Base schema for user attributes."""
    username: str = Field(..., description="The unique username of the user.")
    email: Optional[str] = Field(None, description="The user's email address.")
    full_name: Optional[str] = Field(None, description="The user's full name.")
    disabled: Optional[bool] = Field(None, description="Whether the user account is disabled.")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., description="The user's password.")


class UserUpdate(BaseModel):
    """Schema for updating an existing user. All fields are optional."""
    username: Optional[str] = Field(None, description="New username for the user.")
    email: Optional[str] = Field(None, description="New email for the user.")
    full_name: Optional[str] = Field(None, description="New full name for the user.")
    password: Optional[str] = Field(None, description="New password for the user.")
    disabled: Optional[bool] = Field(None, description="Set the disabled status of the user.")


class User(UserBase):
    """Schema for representing a user in API responses (read operations)."""
    id: str = Field(..., description="Unique identifier for the user.")
    # Include relationships if needed in responses (e.g., user_roles, comments, project_memberships)
    user_roles: List["UserRole"] = []
    # Removed uploaded_files relationship
    # comments: List["Comment"] = []
    # project_memberships: List["ProjectMember"] = []

    model_config = ConfigDict(from_attributes=True)


# --- User Role Schemas ---
class UserRoleBase(BaseModel):
    """Base schema for user role attributes."""
    user_id: str = Field(..., description="The ID of the user.")
    role_name: str = Field(
        ..., description="The name of the role (e.g., 'admin', 'member', 'agent').")


class UserRoleCreate(UserRoleBase):
    """Schema for creating a new user role association."""
    pass


class UserRole(UserRoleBase):
    """Schema for representing a user role association."""
    model_config = ConfigDict(from_attributes=True)


# --- Project Template Schemas ---
class ProjectTemplateBase(BaseModel):
    """Base schema for project template attributes."""
    name: str = Field(..., description="The unique name of the project template.")
    description: Optional[str] = Field(
        None, description="Optional text description of the project template.")


class ProjectTemplateCreate(ProjectTemplateBase):
    """Schema for creating a new project template."""
    pass


class ProjectTemplateUpdate(BaseModel):
    """Schema for updating an existing project template. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the project template.")
    description: Optional[str] = Field(
        None, description="New description for the project template.")


class ProjectTemplate(ProjectTemplateBase):
    """Schema for representing a project template."""
    id: str = Field(..., description="Unique identifier for the project template.")

    model_config = ConfigDict(from_attributes=True)


# --- Task Status Schemas ---
class TaskStatusBase(BaseModel):
    """Base schema for task status attributes."""
    name: str = Field(..., description="The unique name of the task status (e.g., 'To Do', 'In Progress').")
    description: Optional[str] = Field(
        None, description="Optional description of the status.")
    order: int = Field(..., description="The order of the status in a workflow.")
    is_final: bool = Field(False, description="Whether this status indicates task completion.")


class TaskStatusCreate(TaskStatusBase):
    """Schema for creating a new task status."""
    pass


class TaskStatusUpdate(BaseModel):
    """Schema for updating an existing task status. All fields are optional."""
    name: Optional[str] = Field(None, description="New name for the status.")
    description: Optional[str] = Field(None, description="New description for the status.")
    order: Optional[int] = Field(None, description="New order for the status.")
    is_final: Optional[bool] = Field(None, description="New final status.")


class TaskStatus(TaskStatusBase):
    """Schema for representing a task status."""
    id: int = Field(..., description="Unique integer identifier for the status.")

    model_config = ConfigDict(from_attributes=True)


# --- Memory Schemas ---
# Assuming these are already defined and correct based on previous work
# They should align with the new MemoryEntity, MemoryObservation, MemoryRelation models


class MemoryEntityBase(BaseModel):
    type: str = Field(..., description="The type of the memory entity (e.g., 'concept', 'person', 'file').")
    name: str = Field(..., description="The unique name or identifier of the memory entity.")
    description: Optional[str] = Field(None, description="A brief description of the entity.")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="Optional structured metadata.")


class MemoryEntityCreate(MemoryEntityBase):
    pass


class MemoryEntityUpdate(BaseModel):
    # Allow partial updates for MemoryEntity
    type: Optional[str] = Field(None, description="New type for the entity.")
    name: Optional[str] = Field(None, description="New name for the entity.")
    description: Optional[str] = Field(None, description="New description for the entity.")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="New metadata for the entity.")


class MemoryEntity(MemoryEntityBase):
    id: int = Field(..., description="Unique integer ID of the memory entity.")

    # Optional relationships (can be loaded with joinedload)
    observations: List["MemoryObservation"] = []
    relations_as_from: List["MemoryRelation"] = []
    relations_as_to: List["MemoryRelation"] = []

    model_config = ConfigDict(from_attributes=True)


class MemoryObservationBase(BaseModel):
    content: str = Field(..., description="The content of the observation.")
    source: Optional[str] = Field(None, description="The source of the observation (e.g., 'user', 'agent', 'system').")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="Optional structured metadata for the observation.")


class MemoryObservationCreate(MemoryObservationBase):
    entity_id: int = Field(..., description="The ID of the memory entity this observation belongs to.")


class MemoryObservation(MemoryObservationBase):
    id: int = Field(..., description="Unique integer ID of the observation.")
    entity_id: int = Field(..., description="The ID of the memory entity this observation belongs to.")
    timestamp: datetime = Field(..., description="Timestamp when the observation was recorded.")

    model_config = ConfigDict(from_attributes=True)


class MemoryRelationBase(BaseModel):
    from_entity_id: int = Field(..., description="The ID of the source memory entity.")
    to_entity_id: int = Field(..., description="The ID of the target memory entity.")
    relation_type: str = Field(..., description="The type of the relationship (e.g., 'related_to', 'depends_on').")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="Optional structured metadata for the relation.")


class MemoryRelationCreate(MemoryRelationBase):
    pass


class MemoryRelation(MemoryRelationBase):
    id: int = Field(..., description="Unique integer ID of the relation.")
    created_at: datetime = Field(..., description="Timestamp when the relation was created.")

    model_config = ConfigDict(from_attributes=True)



# --- Universal Mandate Schemas ---
class UniversalMandateBase(BaseModel):
    """Base schema for universal mandate attributes."""
    title: str = Field(..., description="The title of the universal mandate.")
    description: str = Field(..., description="Detailed description of the mandate.")
    priority: int = Field(5, description="Priority of the mandate (1-10 scale).")
    is_active: bool = Field(True, description="Whether the mandate is active.")


class UniversalMandateCreate(UniversalMandateBase):
    """Schema for creating a new universal mandate."""
    pass


class UniversalMandateUpdate(BaseModel):
    """Schema for updating an existing universal mandate."""
    title: Optional[str] = Field(None, description="Updated title of the mandate.")
    description: Optional[str] = Field(None, description="Updated description of the mandate.")
    priority: Optional[int] = Field(None, description="Updated priority (1-10 scale).")
    is_active: Optional[bool] = Field(None, description="Updated active status.")


class UniversalMandate(UniversalMandateBase):
    """Schema for representing a universal mandate in API responses."""
    id: str = Field(..., description="Unique identifier for the mandate.")
    created_at: datetime = Field(..., description="Timestamp when the mandate was created.")
    updated_at: datetime = Field(..., description="Timestamp when the mandate was last updated.")

    model_config = ConfigDict(from_attributes=True)


# --- Agent Role Schemas ---
class AgentRoleBase(BaseModel):
    """Base schema for agent role attributes."""
    name: str = Field(..., description="The unique name of the agent role.")
    display_name: str = Field(..., description="Display name for the agent role.")
    primary_purpose: str = Field(..., description="Primary purpose of the agent role.")
    is_active: bool = Field(True, description="Whether the role is active.")


class AgentRoleCreate(AgentRoleBase):
    """Schema for creating a new agent role."""
    pass


class AgentRoleUpdate(BaseModel):
    """Schema for updating an existing agent role."""
    name: Optional[str] = Field(None, description="Updated name of the role.")
    display_name: Optional[str] = Field(None, description="Updated display name.")
    primary_purpose: Optional[str] = Field(None, description="Updated primary purpose.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")


class AgentRole(AgentRoleBase):
    """Schema for representing an agent role in API responses."""
    id: str = Field(..., description="Unique identifier for the role.")
    created_at: datetime = Field(..., description="Timestamp when the role was created.")
    updated_at: datetime = Field(..., description="Timestamp when the role was last updated.")

    model_config = ConfigDict(from_attributes=True)


# --- Workflow Schemas ---
class WorkflowBase(BaseModel):
    """Base schema for workflow attributes."""
    name: str = Field(..., description="The name of the workflow.")
    description: Optional[str] = Field(None, description="Description of the workflow.")
    workflow_type: str = Field(..., description="Type of the workflow.")
    entry_criteria: Optional[str] = Field(None, description="Entry criteria for the workflow.")
    success_criteria: Optional[str] = Field(None, description="Success criteria for the workflow.")
    is_active: bool = Field(True, description="Whether the workflow is active.")


class WorkflowCreate(WorkflowBase):
    """Schema for creating a new workflow."""
    pass


class WorkflowUpdate(BaseModel):
    """Schema for updating an existing workflow."""
    name: Optional[str] = Field(None, description="Updated name of the workflow.")
    description: Optional[str] = Field(None, description="Updated description.")
    workflow_type: Optional[str] = Field(None, description="Updated workflow type.")
    entry_criteria: Optional[str] = Field(None, description="Updated entry criteria.")
    success_criteria: Optional[str] = Field(None, description="Updated success criteria.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")


class Workflow(WorkflowBase):
    """Schema for representing a workflow in API responses."""
    id: str = Field(..., description="Unique identifier for the workflow.")
    created_at: datetime = Field(..., description="Timestamp when the workflow was created.")
    updated_at: datetime = Field(..., description="Timestamp when the workflow was last updated.")

    model_config = ConfigDict(from_attributes=True)


# --- Agent Prompt Template Schemas ---
class AgentPromptTemplateBase(BaseModel):
    """Base schema for agent prompt template attributes."""
    template_name: str = Field(..., description="Name of the prompt template.")
    template_content: str = Field(..., description="Content of the prompt template.")
    context_requirements: Optional[str] = Field(None, description="Context requirements for the template.")
    is_active: bool = Field(True, description="Whether the template is active.")


class AgentPromptTemplateCreate(AgentPromptTemplateBase):
    """Schema for creating a new agent prompt template."""
    agent_role_id: str = Field(..., description="ID of the associated agent role.")


class AgentPromptTemplateUpdate(BaseModel):
    """Schema for updating an existing agent prompt template."""
    template_name: Optional[str] = Field(None, description="Updated template name.")
    template_content: Optional[str] = Field(None, description="Updated template content.")
    context_requirements: Optional[str] = Field(None, description="Updated context requirements.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")


class AgentPromptTemplate(AgentPromptTemplateBase):
    """Schema for representing an agent prompt template in API responses."""
    id: str = Field(..., description="Unique identifier for the template.")
    agent_role_id: str = Field(..., description="ID of the associated agent role.")
    created_at: datetime = Field(..., description="Timestamp when the template was created.")
    updated_at: datetime = Field(..., description="Timestamp when the template was last updated.")

    model_config = ConfigDict(from_attributes=True)


# --- Agent Rule Violation Schemas ---
class AgentRuleViolationBase(BaseModel):
    """Base schema for agent rule violation attributes."""
    agent_id: str = Field(..., description="ID of the agent that violated the rule.")
    rule_type: str = Field(..., description="Type of rule that was violated.")
    rule_id: str = Field(..., description="ID of the specific rule violated.")
    violation_description: str = Field(..., description="Description of the violation.")
    severity: str = Field(..., description="Severity of the violation.")
    context_data: Optional[str] = Field(None, description="Additional context data.")


class AgentRuleViolationCreate(AgentRuleViolationBase):
    """Schema for creating a new agent rule violation."""
    pass


class AgentRuleViolation(AgentRuleViolationBase):
    """Schema for representing an agent rule violation in API responses."""
    id: str = Field(..., description="Unique identifier for the violation.")
    created_at: datetime = Field(..., description="Timestamp when the violation was recorded.")

    model_config = ConfigDict(from_attributes=True)


# --- Agent Behavior Log Schemas ---
class AgentBehaviorLogBase(BaseModel):
    """Base schema for agent behavior log attributes."""
    agent_id: str = Field(..., description="ID of the agent.")
    action_type: str = Field(..., description="Type of action performed.")
    action_description: str = Field(..., description="Description of the action.")
    context_data: Optional[str] = Field(None, description="Additional context data.")
    outcome: Optional[str] = Field(None, description="Outcome of the action.")


class AgentBehaviorLogCreate(AgentBehaviorLogBase):
    """Schema for creating a new agent behavior log entry."""
    pass


class AgentBehaviorLog(AgentBehaviorLogBase):
    """Schema for representing an agent behavior log in API responses."""
    id: str = Field(..., description="Unique identifier for the log entry.")
    created_at: datetime = Field(..., description="Timestamp when the log was created.")

    model_config = ConfigDict(from_attributes=True)


# --- Project Member Schemas ---
class ProjectMemberBase(BaseModel):
    """Base schema for project member attributes."""
    project_id: str = Field(..., description="ID of the project.")
    user_id: str = Field(..., description="ID of the user.")
    role: str = Field(..., description="Role of the user in the project (e.g., owner, collaborator, viewer).")


class ProjectMemberCreate(ProjectMemberBase):
    """Schema for creating a new project member."""
    pass


class ProjectMemberUpdate(BaseModel):
    """Schema for updating an existing project member."""
    role: Optional[str] = Field(None, description="Updated role of the user in the project.")


class ProjectMember(ProjectMemberBase):
    """Schema for representing a project member in API responses."""
    model_config = ConfigDict(from_attributes=True)


# Rebuild models after all schema definitions to resolve forward references
Project.model_rebuild()
Agent.model_rebuild()
Task.model_rebuild() # Ensure Task rebuilds with correct relationships
User.model_rebuild() # User needs rebuild due to removed uploaded_files
Comment.model_rebuild()
MemoryEntity.model_rebuild()
MemoryObservation.model_rebuild()
MemoryRelation.model_rebuild()
UniversalMandate.model_rebuild()
AgentRole.model_rebuild()
Workflow.model_rebuild()
AgentPromptTemplate.model_rebuild()
AgentRuleViolation.model_rebuild()
AgentBehaviorLog.model_rebuild()
ProjectMember.model_rebuild()
