import { z } from 'zod';
import { Task } from './task';

// Base Project schema for validation
export const projectSchema = z.object({
    id: z.number(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().optional()
});

// Runtime type for Project
export type Project = z.infer<typeof projectSchema>;

// Schema for creating a new project
export const projectCreateSchema = projectSchema.omit({ 
    id: true, 
    created_at: true, 
    updated_at: true 
});

export type ProjectCreateData = z.infer<typeof projectCreateSchema>;

// Schema for updating a project
export const projectUpdateSchema = projectSchema.partial().omit({ 
    id: true, 
    created_at: true, 
    updated_at: true 
});

export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>;

// Project with computed fields and relationships
export interface ProjectWithMeta extends Project {
    tasks?: Task[];
    taskCount?: number;
    completedTaskCount?: number;
    progress?: number;
    status?: 'not_started' | 'in_progress' | 'completed';
}

// Project filter options
export interface ProjectFilters {
    search?: string;
    status?: 'all' | 'not_started' | 'in_progress' | 'completed';
}

// Project sort options
export type ProjectSortField = 'created_at' | 'name' | 'progress' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface ProjectSortOptions {
    field: ProjectSortField;
    direction: SortDirection;
}

// Project error types
export interface ProjectError {
    code: string;
    message: string;
    field?: string;
}

// Project API response types
export interface ProjectResponse {
    data: Project;
    error?: ProjectError;
}

export interface ProjectListResponse {
    data: Project[];
    total: number;
    page: number;
    pageSize: number;
    error?: ProjectError;
} 