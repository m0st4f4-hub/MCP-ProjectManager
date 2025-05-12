import { z } from 'zod';

// Base Subtask schema for validation
export const subtaskSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    completed: z.boolean(),
    task_id: z.string(), // ID of the parent task
    created_at: z.string(), // Assuming string format from API (e.g., ISO 8601)
    updated_at: z.string().nullable().optional(), // Assuming string format
});

// Runtime type for Subtask
export type Subtask = z.infer<typeof subtaskSchema>;

// Schema for creating a new subtask (client-side data)
// task_id will be part of the URL path, not the body
export const subtaskCreateSchema = subtaskSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    task_id: true, // task_id is typically part of the route, not body for creation
});

export type SubtaskCreateData = z.infer<typeof subtaskCreateSchema>;

// Schema for updating an existing subtask
export const subtaskUpdateSchema = subtaskCreateSchema.partial(); // All fields optional for update

export type SubtaskUpdateData = z.infer<typeof subtaskUpdateSchema>; 