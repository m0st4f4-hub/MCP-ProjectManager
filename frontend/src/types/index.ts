export * from './project';
export * from './agent';
export * from './agents';
export * from './task';
export * from './user';
export * from './audit_log';
export * from './memory';
export * from './comment';
export * from './rules';
export * from './mcp';
export * from './project_template';
export * from './agent_prompt_template';
export * from './verification_requirement';
export * from './handoff';

// Common types used across the application
// Canonical shared sort direction type for all entities
export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
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
