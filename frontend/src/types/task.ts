import { z } from "zod";
// import { SortDirection, TaskSortField, TaskSortOptions } from "./index";

export enum TaskStatus {
  PENDING = "pending",
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  BLOCKED = "blocked",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Base Task schema for validation
export const taskSchema = z.object({
  project_id: z.string(),
  task_number: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.string().default("TO_DO"),
  assignee_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  agent_id: z.string().nullable().optional(),
  agent_name: z.string().nullable().optional(),
  agent_status: z.string().optional(),
  is_archived: z.boolean().optional(),
  dependencies: z.array(z.object({
    project_id: z.string(),
    task_number: z.number(),
  })).optional(),
});

// Runtime type for Task
export type Task = z.infer<typeof taskSchema>;

// Schema for creating a new task
export const taskCreateSchema = taskSchema.omit({
  task_number: true,
  created_at: true,
  updated_at: true,
});

export type TaskCreateData = z.infer<typeof taskCreateSchema>;

// Schema for updating a task
export const taskUpdateSchema = taskSchema.partial().omit({
  project_id: true,
  task_number: true,
  created_at: true,
  updated_at: true,
});

export type TaskUpdateData = z.infer<typeof taskUpdateSchema>;

// Task with computed fields
export interface TaskWithMeta extends Task {
  completed?: boolean;
}

// Task filter options
// export interface TaskFilters {
//   projectId?: string;
//   agentId?: string;
//   status?: "all" | "completed" | "active";
//   search?: string;
//   hideCompleted?: boolean;
//   is_archived?: boolean | null;
// }

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

// --- Task File Association Schemas ---
export const taskFileAssociationBaseSchema = z.object({
  file_id: z.string(), // The ID of the associated file
});

export const taskFileAssociationCreateSchema = taskFileAssociationBaseSchema;

export type TaskFileAssociationCreateData = z.infer<typeof taskFileAssociationCreateSchema>;

export const taskFileAssociationSchema = taskFileAssociationBaseSchema.extend({
  task_project_id: z.string(), // The project ID of the associated task
  task_number: z.number(), // The task number within the project
});

export type TaskFileAssociation = z.infer<typeof taskFileAssociationSchema>;

// --- Task Dependency Schemas ---
export const taskDependencyBaseSchema = z.object({
  dependent_task_project_id: z.string(), // Project ID of the task that depends
  dependent_task_number: z.number(), // Task number of the task that depends
  depends_on_task_project_id: z.string(), // Project ID of the task being depended on
  depends_on_task_number: z.number(), // Task number of the task being depended on
  dependency_type: z.string(), // Type of dependency (e.g., 'finishes_before_starts')
});

export const taskDependencyCreateSchema = taskDependencyBaseSchema;

export type TaskDependencyCreateData = z.infer<typeof taskDependencyCreateSchema>;

export const taskDependencySchema = taskDependencyBaseSchema.extend({
  // If backend returns an ID for the relationship itself, add it here
  // id: z.string(),
});

export type TaskDependency = z.infer<typeof taskDependencySchema>;
