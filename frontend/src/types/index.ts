// Core entity types
export * from './project';
export * from './agent';
export * from './agents';
export * from './agent_role';
export * from './task';
export * from './user';
export * from './audit_log';
export * from './memory';
export * from './comment';
export * from './rules';
export * from './mcp';
export * from './project_template';
export * from './agent_prompt_template';
export * from './handoff';
export * from './verification_requirement';
export * from './verificationRequirement';
export * from './error_protocol';
export * from './workflow';
export * from './statusTransition';
export * from './generated';
export * from './generatedEnums';

// Common types used across the application
// Canonical shared sort direction type for all entities
export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface Task {
  id: string;
  project_id: string;
  task_number: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  agent_id?: string;
  due_date?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  dependencies?: string[];
  estimated_hours?: number;
  actual_hours?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoryEntity {
  id: string;
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  observations?: MemoryObservation[];
  relations?: MemoryRelation[];
}

export interface MemoryObservation {
  id: string;
  entity_id: string;
  content: string;
  source: string;
  confidence?: number;
  created_at: string;
}

export interface MemoryRelation {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  relation_type: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Enums
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

// Settings and configuration
export interface ProjectSettings {
  auto_assign: boolean;
  notifications_enabled: boolean;
  default_priority: TaskPriority;
  allowed_statuses: TaskStatus[];
  custom_fields?: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  default_value?: any;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form types
export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
  estimated_hours?: number;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  assignee?: string | 'all';
  search?: string;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ProjectFilters {
  is_archived?: boolean;
  search?: string;
  owner_id?: string;
}

// Event types
export interface McpEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface SystemMetrics {
  active_connections: number;
  total_projects: number;
  total_tasks: number;
  memory_usage: number;
  cpu_usage: number;
  uptime: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Theme and UI types
export interface ThemeConfig {
  colorMode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
}

export interface NotificationConfig {
  enabled: boolean;
  types: {
    task_assigned: boolean;
    task_completed: boolean;
    project_updated: boolean;
    system_alerts: boolean;
  };
}

// Canonical task sort field type (should match all UI/usage fields)
export type TaskSortField =
  | 'created_at'
  | 'title'
  | 'status'
  | 'agent'
  | 'project_id'
  | 'updated_at';

// Canonical task sort options type
export interface TaskSortOptions {
  field: TaskSortField;
  direction: SortDirection;
}

// Add shared types for group by and view mode
export type GroupByType = 'status' | 'project' | 'agent' | 'parent';
export type ViewMode = 'list' | 'kanban';
