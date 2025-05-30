import { z } from "zod";

// --- Comment Schemas ---
export const commentBaseSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  task_project_id: z.string().nullable().optional(),
  task_task_number: z.number().nullable().optional(),
  project_id: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
});

export const commentCreateSchema = commentBaseSchema.omit({
  user_id: true, // User ID will be set by backend from auth
});

export type CommentCreateData = z.infer<typeof commentCreateSchema>;

export const commentUpdateSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

export type CommentUpdateData = z.infer<typeof commentUpdateSchema>;

export const commentSchema = commentBaseSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  author_name: z.string().nullable().optional(), // Populated from user relationship
});

export type Comment = z.infer<typeof commentSchema>;

// --- Comment API Response Types ---
export interface CommentResponse {
  data: Comment;
  error?: { code: string; message: string; field?: string };
}

export interface CommentListResponse {
  data: Comment[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

// --- Comment Filter Types ---
export interface CommentFilters {
  task_project_id?: string;
  task_task_number?: number;
  project_id?: string;
  user_id?: string;
  search?: string; // Search within comment content
}
