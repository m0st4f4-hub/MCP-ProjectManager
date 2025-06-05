import { z } from 'zod';

export const handoffCriteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string(),
  description: z.string().nullable().optional(),
  target_agent_role: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const handoffCriteriaCreateSchema = handoffCriteriaBaseSchema;
export type HandoffCriteriaCreateData = z.infer<
  typeof handoffCriteriaCreateSchema
>;

export const handoffCriteriaSchema = handoffCriteriaBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type HandoffCriteria = z.infer<typeof handoffCriteriaSchema>;
