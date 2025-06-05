import { z } from 'zod';

export const criteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string().min(1, 'Criteria is required'),
  description: z.string().nullable().optional(),
  target_agent_role: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const criteriaCreateSchema = criteriaBaseSchema.omit({
  is_active: true,
});

export type CriteriaCreateData = z.infer<typeof criteriaCreateSchema>;

export const criteriaUpdateSchema = criteriaBaseSchema.partial();

export type CriteriaUpdateData = z.infer<typeof criteriaUpdateSchema>;

export const criteriaSchema = criteriaBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type Criteria = z.infer<typeof criteriaSchema>;
