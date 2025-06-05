import { z } from 'zod';

export const workflowBaseSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  workflow_type: z.string(),
  entry_criteria: z.string().nullable().optional(),
  success_criteria: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const workflowCreateSchema = workflowBaseSchema;
export type WorkflowCreateData = z.infer<typeof workflowCreateSchema>;

export const workflowUpdateSchema = workflowBaseSchema.partial();
export type WorkflowUpdateData = z.infer<typeof workflowUpdateSchema>;

export const workflowSchema = workflowBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type Workflow = z.infer<typeof workflowSchema>;

export const workflowStepBaseSchema = z.object({
  workflow_id: z.string(),
  agent_role_id: z.string(),
  step_order: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  prerequisites: z.string().nullable().optional(),
  expected_outputs: z.string().nullable().optional(),
  verification_points: z.string().nullable().optional(),
  estimated_duration_minutes: z.number().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const workflowStepCreateSchema = workflowStepBaseSchema;
export type WorkflowStepCreateData = z.infer<typeof workflowStepCreateSchema>;

export const workflowStepUpdateSchema = workflowStepBaseSchema.partial();
export type WorkflowStepUpdateData = z.infer<typeof workflowStepUpdateSchema>;

export const workflowStepSchema = workflowStepBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
