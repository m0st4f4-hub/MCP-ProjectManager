export * from './task';
export * from './project';
export * from './agent';
export * from './subtask';

// Common types used across the application
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

export interface TaskFilters {
    status?: 'all' | 'completed' | 'active' | null;
    projectId?: number | null;
    agentName?: string | null;
    searchTerm?: string | null;
}

export interface TaskSortOptions {
    field: 'title' | 'created_at' | 'updated_at' | 'priority' | 'status' | string;
    direction: SortDirection;
} 