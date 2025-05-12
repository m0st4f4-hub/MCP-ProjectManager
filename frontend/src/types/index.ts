export * from './project';
export * from './agent';
export * from './task';

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