/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

/**
 * Role of the user in the project (owner, member, or viewer).
 */
export type ProjectMemberRole = "owner" | "member" | "viewer";
/**
 * The name of the role.
 */
export type UserRoleEnum = "admin" | "manager" | "engineer" | "viewer" | "user" | "agent";
/**
 * Role of the user in the project (owner, member, or viewer).
 */
export type ProjectMemberRole1 = "owner" | "member" | "viewer";
/**
 * Role of the user in the project (owner, member, or viewer).
 */
export type ProjectMemberRole2 = "owner" | "member" | "viewer";
/**
 * Enum for project member roles.
 */
export type ProjectMemberRole3 = "owner" | "member" | "viewer";
/**
 * The current status of the task.
 */
export type TaskStatusEnum =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt";
/**
 * The current status of the task.
 */
export type TaskStatusEnum1 =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt";
/**
 * The current status of the task.
 */
export type TaskStatusEnum2 =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt";
/**
 * The current status of the task.
 */
export type TaskStatusEnum3 =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt";
/**
 * The current status of the task.
 */
export type TaskStatusEnum4 =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt";
/**
 * Enum for standardized task statuses.
 */
export type TaskStatusEnum5 =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked"
  | "Cancelled"
  | "Context Acquired"
  | "Planning Complete"
  | "Execution In Progress"
  | "Pending Verification"
  | "Verification Complete"
  | "Verification Failed"
  | "Completed Awaiting Project Manager"
  | "Completed Handoff"
  | "Failed"
  | "In Progress Awaiting Subtask"
  | "Pending Recovery Attempt";
/**
 * Enum for user roles.
 */
export type UserRoleEnum1 = "admin" | "manager" | "engineer" | "viewer" | "user" | "agent";
/**
 * Enum for user roles.
 */
export type UserRoleEnum2 = "admin" | "manager" | "engineer" | "viewer" | "user" | "agent";
/**
 * Enum for user roles.
 */
export type UserRoleEnum3 = "admin" | "manager" | "engineer" | "viewer" | "user" | "agent";

/**
 * Schema for representing an agent in API responses (read operations).
 */
export interface Agent {
  /**
   * The unique name of the agent.
   */
  name: string;
  /**
   * Whether the agent is archived.
   */
  is_archived?: boolean;
  /**
   * Unique identifier for the agent.
   */
  id: string;
  /**
   * Timestamp when the agent was created.
   */
  created_at: string;
  /**
   * Timestamp when the agent was last updated.
   */
  updated_at?: string | null;
  /**
   * Rules associated with this agent (populated from ORM).
   */
  agent_rules?: AgentRule[];
}
/**
 * Schema for representing an agent rule in API responses (includes ID).
 */
export interface AgentRule {
  /**
   * ID of the agent this rule is associated with.
   */
  agent_id: string;
  /**
   * Type of the rule (e.e., 'constraint', 'guideline').
   */
  rule_type: string;
  /**
   * The actual content/text of the rule.
   */
  rule_content: string;
  /**
   * Whether the rule is currently active.
   */
  is_active?: boolean;
  /**
   * Unique identifier for the agent rule.
   */
  id: string;
}
/**
 * Base schema for agent attributes.
 */
export interface AgentBase {
  /**
   * The unique name of the agent.
   */
  name: string;
  /**
   * Whether the agent is archived.
   */
  is_archived?: boolean;
}
/**
 * Schema for creating a new agent. Inherits attributes from AgentBase.
 */
export interface AgentCreate {
  /**
   * The unique name of the agent.
   */
  name: string;
  /**
   * Whether the agent is archived.
   */
  is_archived?: boolean;
}
/**
 * Schema representing an error protocol.
 */
export interface AgentErrorProtocol {
  /**
   * ID of the related agent role.
   */
  agent_role_id: string;
  /**
   * Type of error this protocol handles.
   */
  error_type: string;
  /**
   * Instructions for handling the error.
   */
  protocol: string;
  /**
   * Priority of the protocol.
   */
  priority?: number;
  /**
   * Whether the protocol is active.
   */
  is_active?: boolean;
  /**
   * Unique identifier of the protocol.
   */
  id: string;
  /**
   * Creation timestamp.
   */
  created_at: string;
}
/**
 * Base schema for agent error protocols.
 */
export interface AgentErrorProtocolBase {
  /**
   * ID of the related agent role.
   */
  agent_role_id: string;
  /**
   * Type of error this protocol handles.
   */
  error_type: string;
  /**
   * Instructions for handling the error.
   */
  protocol: string;
  /**
   * Priority of the protocol.
   */
  priority?: number;
  /**
   * Whether the protocol is active.
   */
  is_active?: boolean;
}
/**
 * Schema for creating an error protocol.
 */
export interface AgentErrorProtocolCreate {
  /**
   * ID of the related agent role.
   */
  agent_role_id: string;
  /**
   * Type of error this protocol handles.
   */
  error_type: string;
  /**
   * Instructions for handling the error.
   */
  protocol: string;
  /**
   * Priority of the protocol.
   */
  priority?: number;
  /**
   * Whether the protocol is active.
   */
  is_active?: boolean;
}
/**
 * Schema for updating an error protocol.
 */
export interface AgentErrorProtocolUpdate {
  /**
   * Updated error type.
   */
  error_type?: string | null;
  /**
   * Updated protocol text.
   */
  protocol?: string | null;
  /**
   * Updated priority.
   */
  priority?: number | null;
  /**
   * Updated active state.
   */
  is_active?: boolean | null;
}
/**
 * Schema representing handoff criteria.
 */
export interface AgentHandoffCriteria {
  /**
   * ID of the related agent role.
   */
  agent_role_id: string;
  /**
   * Handoff trigger criteria.
   */
  criteria: string;
  /**
   * Optional description of the criteria.
   */
  description?: string | null;
  /**
   * Suggested target agent role for handoff.
   */
  target_agent_role?: string | null;
  /**
   * Whether this criteria is active.
   */
  is_active?: boolean;
  /**
   * Unique identifier for the criteria.
   */
  id: string;
  /**
   * Timestamp the criteria was created.
   */
  created_at: string;
}
/**
 * Base schema for agent handoff criteria.
 */
export interface AgentHandoffCriteriaBase {
  /**
   * ID of the related agent role.
   */
  agent_role_id: string;
  /**
   * Handoff trigger criteria.
   */
  criteria: string;
  /**
   * Optional description of the criteria.
   */
  description?: string | null;
  /**
   * Suggested target agent role for handoff.
   */
  target_agent_role?: string | null;
  /**
   * Whether this criteria is active.
   */
  is_active?: boolean;
}
/**
 * Schema for creating handoff criteria.
 */
export interface AgentHandoffCriteriaCreate {
  /**
   * ID of the related agent role.
   */
  agent_role_id: string;
  /**
   * Handoff trigger criteria.
   */
  criteria: string;
  /**
   * Optional description of the criteria.
   */
  description?: string | null;
  /**
   * Suggested target agent role for handoff.
   */
  target_agent_role?: string | null;
  /**
   * Whether this criteria is active.
   */
  is_active?: boolean;
}
/**
 * Schema for updating handoff criteria.
 */
export interface AgentHandoffCriteriaUpdate {
  /**
   * ID of the related agent role.
   */
  agent_role_id?: string | null;
  /**
   * Handoff trigger criteria.
   */
  criteria?: string | null;
  /**
   * Optional description of the criteria.
   */
  description?: string | null;
  /**
   * Suggested target agent role for handoff.
   */
  target_agent_role?: string | null;
  /**
   * Whether this criteria is active.
   */
  is_active?: boolean | null;
}
/**
 * Base schema for agent rule attributes.
 * Corresponds to the fields in the 'agent_rules' table.
 */
export interface AgentRuleBase {
  /**
   * ID of the agent this rule is associated with.
   */
  agent_id: string;
  /**
   * Type of the rule (e.e., 'constraint', 'guideline').
   */
  rule_type: string;
  /**
   * The actual content/text of the rule.
   */
  rule_content: string;
  /**
   * Whether the rule is currently active.
   */
  is_active?: boolean;
}
/**
 * Schema for creating a new agent rule.
 * Used by crud.agent_rules.
 */
export interface AgentRuleCreate {
  /**
   * ID of the agent this rule is associated with.
   */
  agent_id: string;
  /**
   * Type of the rule (e.e., 'constraint', 'guideline').
   */
  rule_type: string;
  /**
   * The actual content/text of the rule.
   */
  rule_content: string;
  /**
   * Whether the rule is currently active.
   */
  is_active?: boolean;
}
/**
 * Schema for updating an existing agent rule.
 * All fields are optional. Used by crud.agent_rules.
 */
export interface AgentRuleUpdate {
  /**
   * New agent ID for the rule.
   */
  agent_id?: string | null;
  /**
   * New type for the rule.
   */
  rule_type?: string | null;
  /**
   * New content for the rule.
   */
  rule_content?: string | null;
  /**
   * New active status for the rule.
   */
  is_active?: boolean | null;
}
/**
 * Schema for updating an existing agent. All fields are optional.
 */
export interface AgentUpdate {
  /**
   * New name for the agent.
   */
  name?: string | null;
  /**
   * Set the archived status of the agent.
   */
  is_archived?: boolean | null;
}
/**
 * Schema for representing an error protocol.
 */
export interface ErrorProtocol {
  /**
   * Type of error this protocol handles
   */
  error_type: string;
  /**
   * How the error should be handled
   */
  handling_strategy: string;
  /**
   * Optional retry configuration details
   */
  retry_config?: {
    [k: string]: unknown;
  } | null;
  /**
   * Escalation path if the error cannot be resolved
   */
  escalation_path?: string | null;
  /**
   * Protocol priority (lower is higher)
   */
  priority?: number;
  /**
   * Whether the protocol is active
   */
  is_active?: boolean;
  /**
   * Unique identifier of the protocol
   */
  id: string;
  /**
   * ID of the related agent role
   */
  agent_role_id: string;
  /**
   * Timestamp the protocol was created
   */
  created_at: string;
}
/**
 * Base schema for error handling protocols.
 */
export interface ErrorProtocolBase {
  /**
   * Type of error this protocol handles
   */
  error_type: string;
  /**
   * How the error should be handled
   */
  handling_strategy: string;
  /**
   * Optional retry configuration details
   */
  retry_config?: {
    [k: string]: unknown;
  } | null;
  /**
   * Escalation path if the error cannot be resolved
   */
  escalation_path?: string | null;
  /**
   * Protocol priority (lower is higher)
   */
  priority?: number;
  /**
   * Whether the protocol is active
   */
  is_active?: boolean;
}
/**
 * Schema for creating an error protocol.
 */
export interface ErrorProtocolCreate {
  /**
   * Type of error this protocol handles
   */
  error_type: string;
  /**
   * How the error should be handled
   */
  handling_strategy: string;
  /**
   * Optional retry configuration details
   */
  retry_config?: {
    [k: string]: unknown;
  } | null;
  /**
   * Escalation path if the error cannot be resolved
   */
  escalation_path?: string | null;
  /**
   * Protocol priority (lower is higher)
   */
  priority?: number;
  /**
   * Whether the protocol is active
   */
  is_active?: boolean;
}
/**
 * Schema for updating an error protocol.
 */
export interface ErrorProtocolUpdate {
  error_type?: string | null;
  handling_strategy?: string | null;
  retry_config?: {
    [k: string]: unknown;
  } | null;
  escalation_path?: string | null;
  priority?: number | null;
  is_active?: boolean | null;
}
/**
 * Input schema for file ingestion.
 */
export interface FileIngestInput {
  /**
   * Absolute path to the file to ingest.
   */
  file_path: string;
}
/**
 * Schema for representing a MemoryEntity in API responses.
 */
export interface MemoryEntity {
  /**
   * The type of the memory entity (e.g., 'file', 'url', 'text').
   */
  entity_type: string;
  /**
   * The main content of the entity.
   */
  content?: string | null;
  /**
   * Structured metadata about the entity.
   */
  entity_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * Where the entity came from (e.g., 'file_ingestion', 'web_scrape').
   */
  source?: string | null;
  /**
   * Metadata about the source.
   */
  source_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * The ID of the user who created the entity, if applicable.
   */
  created_by_user_id?: string | null;
  /**
   * Unique integer identifier for the memory entity.
   */
  id: number;
  /**
   * Timestamp when the entity was created.
   */
  created_at: string;
  /**
   * Timestamp when the entity was last updated.
   */
  updated_at?: string | null;
}
/**
 * Base schema for MemoryEntity attributes.
 */
export interface MemoryEntityBase {
  /**
   * The type of the memory entity (e.g., 'file', 'url', 'text').
   */
  entity_type: string;
  /**
   * The main content of the entity.
   */
  content?: string | null;
  /**
   * Structured metadata about the entity.
   */
  entity_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * Where the entity came from (e.g., 'file_ingestion', 'web_scrape').
   */
  source?: string | null;
  /**
   * Metadata about the source.
   */
  source_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * The ID of the user who created the entity, if applicable.
   */
  created_by_user_id?: string | null;
}
/**
 * Schema for creating a new MemoryEntity.
 */
export interface MemoryEntityCreate {
  /**
   * The type of the memory entity (e.g., 'file', 'url', 'text').
   */
  entity_type: string;
  /**
   * The main content of the entity.
   */
  content?: string | null;
  /**
   * Structured metadata about the entity.
   */
  entity_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * Where the entity came from (e.g., 'file_ingestion', 'web_scrape').
   */
  source?: string | null;
  /**
   * Metadata about the source.
   */
  source_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * The ID of the user who created the entity, if applicable.
   */
  created_by_user_id?: string | null;
}
/**
 * Schema for updating an existing MemoryEntity. All fields are optional.
 */
export interface MemoryEntityUpdate {
  /**
   * Update entity type.
   */
  entity_type?: string | null;
  /**
   * Update content.
   */
  content?: string | null;
  /**
   * Update metadata.
   */
  entity_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * Update source.
   */
  source?: string | null;
  /**
   * Update source metadata.
   */
  source_metadata?: {
    [k: string]: unknown;
  } | null;
  /**
   * Update creator user ID.
   */
  created_by_user_id?: string | null;
}
/**
 * Schema for representing a memory observation in API responses, including relationships.
 */
export interface MemoryObservation {
  /**
   * The content of the observation.
   */
  content: string;
  /**
   * Optional structured metadata for the observation.
   */
  metadata_?: {
    [k: string]: unknown;
  } | null;
  /**
   * Unique integer ID of the observation.
   */
  id: number;
  /**
   * The ID of the memory entity this observation belongs to.
   */
  entity_id: number;
  /**
   * Timestamp when the observation was recorded.
   */
  created_at: string;
  /**
   * The entity this observation belongs to.
   */
  entity?: MemoryEntity | null;
}
/**
 * Base schema for memory observation attributes.
 */
export interface MemoryObservationBase {
  /**
   * The content of the observation.
   */
  content: string;
  /**
   * Optional structured metadata for the observation.
   */
  metadata_?: {
    [k: string]: unknown;
  } | null;
}
/**
 * Schema for creating a new memory observation.
 */
export interface MemoryObservationCreate {
  /**
   * The content of the observation.
   */
  content: string;
  /**
   * Optional structured metadata for the observation.
   */
  metadata_?: {
    [k: string]: unknown;
  } | null;
  /**
   * The ID of the memory entity this observation belongs to.
   */
  entity_id: number;
}
/**
 * Schema for representing a memory relation in API responses, including relationships.
 */
export interface MemoryRelation {
  /**
   * The ID of the source memory entity.
   */
  from_entity_id: number;
  /**
   * The ID of the target memory entity.
   */
  to_entity_id: number;
  /**
   * The type of the relationship (e.g., 'related_to', 'depends_on').
   */
  relation_type: string;
  /**
   * Optional structured metadata for the relation.
   */
  metadata_?: {
    [k: string]: unknown;
  } | null;
  /**
   * Unique integer ID of the relation.
   */
  id: number;
  /**
   * Timestamp when the relation was created.
   */
  created_at: string;
  /**
   * Timestamp when the relation was last updated.
   */
  updated_at?: string | null;
  /**
   * The source memory entity.
   */
  from_entity?: MemoryEntity | null;
  /**
   * The target memory entity.
   */
  to_entity?: MemoryEntity | null;
}
/**
 * Base schema for memory relation attributes.
 */
export interface MemoryRelationBase {
  /**
   * The ID of the source memory entity.
   */
  from_entity_id: number;
  /**
   * The ID of the target memory entity.
   */
  to_entity_id: number;
  /**
   * The type of the relationship (e.g., 'related_to', 'depends_on').
   */
  relation_type: string;
  /**
   * Optional structured metadata for the relation.
   */
  metadata_?: {
    [k: string]: unknown;
  } | null;
}
export interface MemoryRelationCreate {
  /**
   * The ID of the source memory entity.
   */
  from_entity_id: number;
  /**
   * The ID of the target memory entity.
   */
  to_entity_id: number;
  /**
   * The type of the relationship (e.g., 'related_to', 'depends_on').
   */
  relation_type: string;
  /**
   * Optional structured metadata for the relation.
   */
  metadata_?: {
    [k: string]: unknown;
  } | null;
}
/**
 * Schema for representing a project in API responses.
 */
export interface Project {
  /**
   * The unique name of the project.
   */
  name: string;
  /**
   * Optional text description of the project.
   */
  description?: string | null;
  /**
   * Whether the project is archived.
   */
  is_archived?: boolean;
  /**
   * Unique identifier for the project.
   */
  id: string;
  /**
   * Timestamp when the project was created.
   */
  created_at: string;
  /**
   * Timestamp when the project was last updated.
   */
  updated_at?: string | null;
  /**
   * Number of tasks associated with this project.
   */
  task_count?: number;
  /**
   * Number of completed tasks in this project.
   */
  completed_task_count?: number;
  /**
   * ID of the user who created the project.
   */
  created_by?: string | null;
}
/**
 * Base schema for project attributes.
 */
export interface ProjectBase {
  /**
   * The unique name of the project.
   */
  name: string;
  /**
   * Optional text description of the project.
   */
  description?: string | null;
  /**
   * Whether the project is archived.
   */
  is_archived?: boolean;
}
/**
 * Schema used for creating a new project.
 */
export interface ProjectCreate {
  /**
   * The unique name of the project.
   */
  name: string;
  /**
   * Optional text description of the project.
   */
  description?: string | null;
  /**
   * Whether the project is archived.
   */
  is_archived?: boolean;
  /**
   * Optional ID of a project template to use.
   */
  template_id?: string | null;
}
export interface ProjectFileAssociation {
  /**
   * The ID of the associated project.
   */
  project_id: string;
  /**
   * The ID of the associated file MemoryEntity.
   */
  file_memory_entity_id: number;
}
/**
 * Base schema for project-file association attributes.
 */
export interface ProjectFileAssociationBase {
  /**
   * The ID of the associated project.
   */
  project_id: string;
  /**
   * The ID of the associated file MemoryEntity.
   */
  file_memory_entity_id: number;
}
export interface ProjectFileAssociationCreate {
  /**
   * The ID of the associated project.
   */
  project_id: string;
  /**
   * The ID of the associated file MemoryEntity.
   */
  file_memory_entity_id: number;
}
/**
 * Schema for representing a project member in API responses.
 */
export interface ProjectMember {
  /**
   * ID of the project.
   */
  project_id: string;
  /**
   * ID of the user.
   */
  user_id: string;
  role: ProjectMemberRole;
  /**
   * Timestamp when the membership was created.
   */
  created_at: string;
  /**
   * Timestamp when the membership was last updated.
   */
  updated_at?: string | null;
  /**
   * The project this membership is for.
   */
  project?: Project | null;
  /**
   * The user this membership is for.
   */
  user?: User | null;
}
/**
 * Schema for representing a user in API responses (read operations).
 */
export interface User {
  /**
   * The unique username of the user.
   */
  username: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's full name.
   */
  full_name?: string | null;
  /**
   * Whether the user account is disabled.
   */
  disabled?: boolean;
  /**
   * Unique identifier for the user.
   */
  id: string;
  user_roles?: UserRole[];
  /**
   * Timestamp when the user was created.
   */
  created_at: string;
  /**
   * Timestamp when the user was last updated.
   */
  updated_at?: string | null;
}
/**
 * Schema for representing a user role association.
 */
export interface UserRole {
  /**
   * The ID of the user.
   */
  user_id: string;
  role_name: UserRoleEnum;
}
/**
 * Base schema for project member attributes.
 */
export interface ProjectMemberBase {
  /**
   * ID of the project.
   */
  project_id: string;
  /**
   * ID of the user.
   */
  user_id: string;
  role: ProjectMemberRole1;
}
export interface ProjectMemberCreate {
  /**
   * ID of the project.
   */
  project_id: string;
  /**
   * ID of the user.
   */
  user_id: string;
  role: ProjectMemberRole2;
}
/**
 * Schema for updating an existing project member.
 */
export interface ProjectMemberUpdate {
  /**
   * Updated role of the user in the project.
   */
  role?: ProjectMemberRole3 | null;
}
/**
 * Schema for representing a project template.
 */
export interface ProjectTemplate {
  /**
   * The unique name of the project template.
   */
  name: string;
  /**
   * Optional description of the template.
   */
  description?: string | null;
  /**
   * Unique identifier for the project template.
   */
  id: string;
}
/**
 * Base schema for project template attributes.
 */
export interface ProjectTemplateBase {
  /**
   * The unique name of the project template.
   */
  name: string;
  /**
   * Optional description of the template.
   */
  description?: string | null;
}
export interface ProjectTemplateCreate {
  /**
   * The unique name of the project template.
   */
  name: string;
  /**
   * Optional description of the template.
   */
  description?: string | null;
}
/**
 * Schema for updating an existing project template. All fields are optional.
 */
export interface ProjectTemplateUpdate {
  /**
   * New name for the project template.
   */
  name?: string | null;
  /**
   * New description for the template.
   */
  description?: string | null;
}
/**
 * Schema for updating an existing project. All fields are optional.
 */
export interface ProjectUpdate {
  /**
   * New name for the project.
   */
  name?: string | null;
  /**
   * New description for the project.
   */
  description?: string | null;
  /**
   * Set the archived status of the project.
   */
  is_archived?: boolean | null;
}
/**
 * Schema for representing a task in API responses, including relationships.
 */
export interface Task {
  title: string;
  description?: string | null;
  status?: TaskStatusEnum;
  is_archived?: boolean | null;
  /**
   * ID of the agent to assign to this task
   */
  agent_id?: string | null;
  /**
   * Unique identifier composed of project_id and task_number
   */
  id: string;
  project_id: string;
  task_number: number;
  created_at: string;
  updated_at?: string | null;
  /**
   * Name of the project this task belongs to.
   */
  project_name?: string | null;
  /**
   * Name of the agent assigned to this task.
   */
  agent_name?: string | null;
  /**
   * Current status of the assigned agent.
   */
  agent_status?: string | null;
  /**
   * ID of the user this task is assigned to.
   */
  assigned_to?: string | null;
  /**
   * Start date for the task.
   */
  start_date?: string | null;
  /**
   * Due date for the task.
   */
  due_date?: string | null;
}
/**
 * Base schema for task attributes.
 */
export interface TaskBase {
  title: string;
  description?: string | null;
  status?: TaskStatusEnum1;
  is_archived?: boolean | null;
  /**
   * ID of the agent to assign to this task
   */
  agent_id?: string | null;
}
/**
 * Schema used for creating a new task.
 * Allows specifying agent by name for convenience during creation.
 */
export interface TaskCreate {
  name: string;
  description?: string | null;
  status?: TaskStatusEnum2;
  is_archived?: boolean | null;
  /**
   * ID of the agent to assign to this task
   */
  agent_id?: string | null;
  /**
   * ID of the project this task belongs to
   */
  project_id: string;
  /**
   * Name of the agent to assign (alternative to agent_id).
   */
  agent_name?: string | null;
  /**
   * ID of the user this task is assigned to.
   */
  assigned_to?: string | null;
  /**
   * Start date for the task
   */
  start_date?: string | null;
  /**
   * Due date for the task
   */
  due_date?: string | null;
}
/**
 * Schema for representing a task dependency in API responses.
 */
export interface TaskDependency {
  /**
   * The project ID of the predecessor task.
   */
  predecessor_project_id: string;
  /**
   * The task number of the predecessor task.
   */
  predecessor_task_number: number;
  /**
   * The project ID of the successor task.
   */
  successor_project_id: string;
  /**
   * The task number of the successor task.
   */
  successor_task_number: number;
  /**
   * Type of dependency (e.g., 'finishes_to_start').
   */
  type: string;
  /**
   * The predecessor task (populated from ORM).
   */
  predecessor?: Task | null;
  /**
   * The successor task (populated from ORM).
   */
  successor?: Task | null;
}
/**
 * Base schema for task dependency attributes.
 */
export interface TaskDependencyBase {
  /**
   * The project ID of the predecessor task.
   */
  predecessor_project_id: string;
  /**
   * The task number of the predecessor task.
   */
  predecessor_task_number: number;
  /**
   * The project ID of the successor task.
   */
  successor_project_id: string;
  /**
   * The task number of the successor task.
   */
  successor_task_number: number;
  /**
   * Type of dependency (e.g., 'finishes_to_start').
   */
  type: string;
}
/**
 * Schema for creating a new task dependency.
 */
export interface TaskDependencyCreate {
  /**
   * The project ID of the predecessor task.
   */
  predecessor_project_id: string;
  /**
   * The task number of the predecessor task.
   */
  predecessor_task_number: number;
  /**
   * The project ID of the successor task.
   */
  successor_project_id: string;
  /**
   * The task number of the successor task.
   */
  successor_task_number: number;
  /**
   * Type of dependency (e.g., 'finishes_to_start').
   */
  type: string;
}
export interface TaskInDB {
  title: string;
  description?: string | null;
  status?: TaskStatusEnum3;
  is_archived?: boolean | null;
  /**
   * ID of the agent to assign to this task
   */
  agent_id?: string | null;
  /**
   * Unique identifier composed of project_id and task_number
   */
  id: string;
  project_id: string;
  task_number: number;
  created_at: string;
  updated_at?: string | null;
  /**
   * Name of the project this task belongs to.
   */
  project_name?: string | null;
  /**
   * Name of the agent assigned to this task.
   */
  agent_name?: string | null;
  /**
   * Current status of the assigned agent.
   */
  agent_status?: string | null;
  /**
   * ID of the user this task is assigned to.
   */
  assigned_to?: string | null;
  /**
   * Start date for the task.
   */
  start_date?: string | null;
  /**
   * Due date for the task.
   */
  due_date?: string | null;
}
export interface TaskInDBBase {
  title: string;
  description?: string | null;
  status?: TaskStatusEnum4;
  is_archived?: boolean | null;
  /**
   * ID of the agent to assign to this task
   */
  agent_id?: string | null;
  /**
   * Unique identifier composed of project_id and task_number
   */
  id: string;
  project_id: string;
  task_number: number;
  created_at: string;
  updated_at?: string | null;
  /**
   * Name of the project this task belongs to.
   */
  project_name?: string | null;
  /**
   * Name of the agent assigned to this task.
   */
  agent_name?: string | null;
  /**
   * Current status of the assigned agent.
   */
  agent_status?: string | null;
  /**
   * ID of the user this task is assigned to.
   */
  assigned_to?: string | null;
  /**
   * Start date for the task.
   */
  start_date?: string | null;
  /**
   * Due date for the task.
   */
  due_date?: string | null;
}
/**
 * Schema for updating an existing task. All fields are optional.
 */
export interface TaskUpdate {
  /**
   * New title for the task.
   */
  title?: string | null;
  /**
   * New description for the task.
   */
  description?: string | null;
  /**
   * New agent ID for the task.
   */
  agent_id?: string | null;
  /**
   * New status for the task.
   */
  status?: TaskStatusEnum5 | null;
  /**
   * Set the archived status of the task.
   */
  is_archived?: boolean | null;
  /**
   * New agent name for the task.
   */
  agent_name?: string | null;
  /**
   * New assignee (user ID) for the task.
   */
  assigned_to?: string | null;
  /**
   * New start date for the task.
   */
  start_date?: string | null;
  /**
   * New due date for the task.
   */
  due_date?: string | null;
}
/**
 * Base schema for user attributes.
 */
export interface UserBase {
  /**
   * The unique username of the user.
   */
  username: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's full name.
   */
  full_name?: string | null;
  /**
   * Whether the user account is disabled.
   */
  disabled?: boolean;
}
/**
 * Schema for creating a new user.
 */
export interface UserCreate {
  /**
   * The unique username of the user.
   */
  username: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's full name.
   */
  full_name?: string | null;
  /**
   * Whether the user account is disabled.
   */
  disabled?: boolean;
  /**
   * The user's password.
   */
  password: string;
  /**
   * List of roles to assign to the user.
   */
  roles?: UserRoleEnum1[];
}
/**
 * Base schema for user role attributes.
 */
export interface UserRoleBase {
  /**
   * The ID of the user.
   */
  user_id: string;
  role_name: UserRoleEnum2;
}
/**
 * Schema for creating a new user role association.
 */
export interface UserRoleCreate {
  /**
   * The ID of the user.
   */
  user_id: string;
  role_name: UserRoleEnum3;
}
/**
 * Schema for updating an existing user. All fields are optional.
 */
export interface UserUpdate {
  /**
   * New username for the user.
   */
  username?: string | null;
  /**
   * New email for the user.
   */
  email?: string | null;
  /**
   * New full name for the user.
   */
  full_name?: string | null;
  /**
   * New password for the user.
   */
  password?: string | null;
  /**
   * Set the disabled status of the user.
   */
  disabled?: boolean | null;
}
/**
 * Base response model for all API responses.
 */
export interface BaseResponse {
  success?: boolean;
  message?: string;
  timestamp?: string;
}
/**
 * Response model for error responses.
 */
export interface ErrorResponse {
  success?: boolean;
  message: string;
  error_code?: string | null;
  error_details?: {
    [k: string]: unknown;
  } | null;
  timestamp?: string;
}
/**
 * Model for pagination parameters.
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}
/**
 * Schema for representing a comment in API responses.
 */
export interface Comment {
  /**
   * The ID of the associated task's project (if applicable).
   */
  task_project_id?: string | null;
  /**
   * The number of the associated task within its project (if applicable).
   */
  task_task_number?: number | null;
  /**
   * The ID of the associated project (if applicable).
   */
  project_id?: string | null;
  /**
   * The ID of the author of the comment.
   */
  author_id: string;
  /**
   * The content of the comment.
   */
  content: string;
  /**
   * Unique identifier for the comment.
   */
  id: string;
  /**
   * Timestamp when the comment was created.
   */
  created_at: string;
  /**
   * Timestamp when the comment was last updated.
   */
  updated_at?: string | null;
  /**
   * The task this comment is on (if applicable).
   */
  task?: Task | null;
  /**
   * The project this comment is on (if applicable).
   */
  project?: Project | null;
  author: User1;
}
/**
 * The author of the comment.
 */
export interface User1 {
  /**
   * The unique username of the user.
   */
  username: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's full name.
   */
  full_name?: string | null;
  /**
   * Whether the user account is disabled.
   */
  disabled?: boolean;
  /**
   * Unique identifier for the user.
   */
  id: string;
  user_roles?: UserRole[];
  /**
   * Timestamp when the user was created.
   */
  created_at: string;
  /**
   * Timestamp when the user was last updated.
   */
  updated_at?: string | null;
}
/**
 * Base schema for comment attributes.
 */
export interface CommentBase {
  /**
   * The ID of the associated task's project (if applicable).
   */
  task_project_id?: string | null;
  /**
   * The number of the associated task within its project (if applicable).
   */
  task_task_number?: number | null;
  /**
   * The ID of the associated project (if applicable).
   */
  project_id?: string | null;
  /**
   * The ID of the author of the comment.
   */
  author_id: string;
  /**
   * The content of the comment.
   */
  content: string;
}
/**
 * Schema for creating a new comment.
 */
export interface CommentCreate {
  /**
   * The ID of the associated task's project (if applicable).
   */
  task_project_id?: string | null;
  /**
   * The number of the associated task within its project (if applicable).
   */
  task_task_number?: number | null;
  /**
   * The ID of the associated project (if applicable).
   */
  project_id?: string | null;
  /**
   * The ID of the author of the comment.
   */
  author_id: string;
  /**
   * The content of the comment.
   */
  content: string;
}
/**
 * Schema for updating an existing comment.
 */
export interface CommentUpdate {
  /**
   * The ID of the associated task's project (if applicable).
   */
  task_project_id?: string | null;
  /**
   * The number of the associated task within its project (if applicable).
   */
  task_task_number?: number | null;
  /**
   * The ID of the associated project (if applicable).
   */
  project_id?: string | null;
  /**
   * The ID of the author of the comment.
   */
  author_id?: string | null;
  /**
   * The content of the comment.
   */
  content?: string | null;
}
/**
 * Schema for representing a task-file association in API responses.
 */
export interface TaskFileAssociation {
  /**
   * The project ID of the associated task.
   */
  task_project_id: string;
  /**
   * The task number within the project.
   */
  task_task_number: number;
  /**
   * The ID of the associated file MemoryEntity.
   */
  file_memory_entity_id: number;
  /**
   * The memory entity representing the file (populated from ORM).
   */
  file_entity?: MemoryEntity | null;
}
/**
 * Base schema for task-file association attributes.
 */
export interface TaskFileAssociationBase {
  /**
   * The project ID of the associated task.
   */
  task_project_id: string;
  /**
   * The task number within the project.
   */
  task_task_number: number;
  /**
   * The ID of the associated file MemoryEntity.
   */
  file_memory_entity_id: number;
}
export interface TaskFileAssociationCreate {
  /**
   * The project ID of the associated task.
   */
  task_project_id: string;
  /**
   * The task number within the project.
   */
  task_task_number: number;
  /**
   * The ID of the associated file MemoryEntity.
   */
  file_memory_entity_id: number;
}
/**
 * Schema representing the entire knowledge graph.
 */
export interface KnowledgeGraph {
  entities: MemoryEntity[];
  relations: MemoryRelation[];
}
/**
 * Schema for representing a task status in API responses.
 */
export interface TaskStatus {
  /**
   * The unique name of the task status (e.g.,'To Do', 'In Progress').
   */
  name: string;
  /**
   * Optional description of the status.
   */
  description?: string | null;
  /**
   * Whether this is the default status for new tasks.
   */
  is_default?: boolean;
  /**
   * Whether this status indicates task completion.
   */
  is_completed?: boolean;
  /**
   * Timestamp when the status was created.
   */
  created_at: string;
  /**
   * Timestamp when the status was last updated.
   */
  updated_at?: string | null;
  /**
   * Tasks with this status (populated from ORM).
   */
  tasks_with_status?: Task[];
}
/**
 * Base schema for task status attributes.
 */
export interface TaskStatusBase {
  /**
   * The unique name of the task status (e.g.,'To Do', 'In Progress').
   */
  name: string;
  /**
   * Optional description of the status.
   */
  description?: string | null;
  /**
   * Whether this is the default status for new tasks.
   */
  is_default?: boolean;
  /**
   * Whether this status indicates task completion.
   */
  is_completed?: boolean;
}
/**
 * Schema for creating a new task status.
 */
export interface TaskStatusCreate {
  /**
   * The unique name of the task status (e.g.,'To Do', 'In Progress').
   */
  name: string;
  /**
   * Optional description of the status.
   */
  description?: string | null;
  /**
   * Whether this is the default status for new tasks.
   */
  is_default?: boolean;
  /**
   * Whether this status indicates task completion.
   */
  is_completed?: boolean;
}
/**
 * Schema for updating an existing task status. All fields are optional.
 */
export interface TaskStatusUpdate {
  /**
   * New name for the status.
   */
  name?: string | null;
  /**
   * New description for the status.
   */
  description?: string | null;
  /**
   * New default status.
   */
  is_default?: boolean | null;
  /**
   * New completed status.
   */
  is_completed?: boolean | null;
}
/**
 * Schema for representing a user with their roles.
 */
export interface UserWithRole {
  /**
   * The unique username of the user.
   */
  username: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's full name.
   */
  full_name?: string | null;
  /**
   * Whether the user account is disabled.
   */
  disabled?: boolean;
  /**
   * Unique identifier for the user.
   */
  id: string;
  /**
   * List of user roles.
   */
  user_roles: UserRole[];
  /**
   * Timestamp when the user was created.
   */
  created_at: string;
  /**
   * Timestamp when the user was last updated.
   */
  updated_at?: string | null;
}
