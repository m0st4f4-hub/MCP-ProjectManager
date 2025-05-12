import { z } from 'zod';

// Base Task schema for validation
export const taskSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    completed: z.boolean(),
    project_id: z.string().nullable().optional(),
    agent_id: z.string().nullable().optional(),
    parent_task_id: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().optional()
});

// Runtime type for Task
export type Task = z.infer<typeof taskSchema>;

// Schema for creating a new task
export const taskCreateSchema = taskSchema.omit({ 
    id: true, 
    created_at: true, 
    updated_at: true 
});

export type TaskCreateData = z.infer<typeof taskCreateSchema>;

// Schema for updating a task
export const taskUpdateSchema = taskSchema.partial().omit({ 
    id: true, 
    created_at: true, 
    updated_at: true 
});

export type TaskUpdateData = z.infer<typeof taskUpdateSchema>;

// Task with computed fields
export interface TaskWithMeta extends Task {
    isOverdue?: boolean;
    daysRemaining?: number;
    priority?: 'low' | 'medium' | 'high';
}

// Task filter options
export interface TaskFilters {
    projectId?: string;
    agentId?: string;
    status?: 'all' | 'completed' | 'active';
    priority?: 'low' | 'medium' | 'high';
    search?: string;
    parent_task_id?: string;
    top_level_only?: boolean;
}

// Task sort options
export type TaskSortField = 'created_at' | 'title' | 'priority' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface TaskSortOptions {
    field: TaskSortField;
    direction: SortDirection;
}

// Task error types
export interface TaskError {
    code: string;
    message: string;
    field?: string;
}

// Task API response types
export interface TaskResponse {
    data: Task;
    error?: TaskError;
}

export interface TaskListResponse {
    data: Task[];
    total: number;
    page: number;
    pageSize: number;
    error?: TaskError;
} 