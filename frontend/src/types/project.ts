import { z } from 'zod';
import { Task } from './task';
import { SortDirection } from './index';
import { ProjectMemberRole } from './generated';

// Base Project schema for validation
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  task_count: z.number().optional(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
  is_archived: z.boolean().optional(),
  completed_task_count: z.number().optional(),
});

// Runtime type for Project
export type Project = z.infer<typeof projectSchema>;

// Schema for creating a new project
export const projectCreateSchema = projectSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    task_count: true,
    completed_task_count: true,
    created_by: true,
  })
  .extend({
    template_id: z.string().optional(),
  });

export type ProjectCreateData = z.infer<typeof projectCreateSchema>;

// Schema for updating a project
export const projectUpdateSchema = projectSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  task_count: true,
});

export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>;

// Project with computed fields and relationships
export interface ProjectWithMeta extends Project {
  tasks?: Task[];
  taskCount?: number;
  completedTaskCount?: number;
  completed_task_count?: number; // Backend compatibility
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

// Project filter options
export interface ProjectFilters {
  search?: string;
  status?: 'all' | 'active' | 'completed';
  agentId?: string | null;
  is_archived?: boolean | null;
  projectId?: string | null;
}

// Project sort options
export type ProjectSortField = 'created_at' | 'name' | 'progress' | 'status';

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

// --- Project Member Schemas ---
export const projectMemberBaseSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
  role: z.nativeEnum(ProjectMemberRole),
});

export const projectMemberCreateSchema = projectMemberBaseSchema;

export type ProjectMemberCreateData = z.infer<typeof projectMemberCreateSchema>;

export const projectMemberUpdateSchema = z.object({
  role: z.nativeEnum(ProjectMemberRole).optional(),
});

export type ProjectMemberUpdateData = z.infer<typeof projectMemberUpdateSchema>;

export const projectMemberSchema = projectMemberBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
});

export type ProjectMember = z.infer<typeof projectMemberSchema>;
