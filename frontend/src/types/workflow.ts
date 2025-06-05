import { z } from "zod";

export const workflowBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  workflow_type: z.string().min(1, "Type is required"),
  entry_criteria: z.string().nullable().optional(),
  success_criteria: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const workflowCreateSchema = workflowBaseSchema;
export type WorkflowCreateData = z.infer<typeof workflowCreateSchema>;

export const workflowUpdateSchema = workflowBaseSchema.partial();
export type WorkflowUpdateData = z.infer<typeof workflowUpdateSchema>;

export const workflowSchema = workflowBaseSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type Workflow = z.infer<typeof workflowSchema>;
