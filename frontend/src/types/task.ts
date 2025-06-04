import { z } from "zod";
// import { SortDirection, TaskSortField, TaskSortOptions } from "./index";

// Task Status Enum matching backend TaskStatusEnum exactly
export enum TaskStatus {
  TO_DO = "To Do",
  IN_PROGRESS = "In Progress", 
  IN_REVIEW = "In Review",
  COMPLETED = "Completed",
  BLOCKED = "Blocked",
  CANCELLED = "Cancelled",
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
  project_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TO_DO),
  agent_id: z.string().nullable().optional(),
  agent_name: z.string().nullable().optional(), // Backend includes this
  agent_status: z.string().nullable().optional(), // Backend includes this
  created_at: z.string(),
  updated_at: z.string().optional(),
  is_archived: z.boolean().optional(),
  assigned_to: z.string().nullable().optional(),
  start_date: z.string().datetime({ message: "Invalid datetime string" }).nullable().optional(),
  due_date: z.string().datetime({ message: "Invalid datetime string" }).nullable().optional(),
});

// Runtime type for Task
export type Task = z.infer<typeof taskSchema> & {
  // Computed ID field for frontend compatibility (project_id + task_number)
  id?: string;
};

// Schema for creating a new task
export const taskCreateSchema = taskSchema.omit({
  task_number: true,
  created_at: true,
  updated_at: true,
}).extend({
  // Add fields from backend TaskCreate if they are to be sent from frontend
  // assigned_to is already in taskSchema and will be part of taskCreateSchema unless omitted
  // start_date is already in taskSchema
  // due_date is already in taskSchema
});

export type TaskCreateData = z.infer<typeof taskCreateSchema>;

// Schema for updating a task
export const taskUpdateSchema = taskSchema.partial().omit({
  project_id: true,
  task_number: true,
  created_at: true,
  updated_at: true,
  // agent_name is already in taskSchema and will be part of taskUpdateSchema due to partial()
  // assigned_to is already in taskSchema
  // start_date is already in taskSchema
  // due_date is already in taskSchema
});

export type TaskUpdateData = z.infer<typeof taskUpdateSchema>;

// Task with computed fields
export interface TaskWithMeta extends Task {
  completed?: boolean;
}

// Task filter options
export interface TaskFilters {
  projectId?: string;
  agentId?: string;
  status?: "all" | "completed" | "active";
  search?: string;
  hideCompleted?: boolean;
  is_archived?: boolean | null;
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

// --- Task Comment Schemas ---
export const taskCommentBaseSchema = z.object({
  task_project_id: z.string(),
  task_number: z.number(),
  user_id: z.string().nullable(), // Or a specific user schema/ID type
  content: z.string().min(1, "Comment content cannot be empty"),
});

export const taskCommentCreateSchema = taskCommentBaseSchema;
export type TaskCommentCreateData = z.infer<typeof taskCommentCreateSchema>;

export const taskCommentSchema = taskCommentBaseSchema.extend({
  id: z.string(), // Unique ID for the comment
  created_at: z.string(), // ISO date string
  updated_at: z.string().optional(), // ISO date string
});

export type TaskComment = z.infer<typeof taskCommentSchema>;
