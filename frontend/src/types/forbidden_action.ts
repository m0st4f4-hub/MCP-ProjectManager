import { z } from 'zod';

export const forbiddenActionBaseSchema = z.object({
  action: z.string(),
  reason: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const forbiddenActionCreateSchema = forbiddenActionBaseSchema.omit({
  is_active: true,
});
export type ForbiddenActionCreateData = z.infer<typeof forbiddenActionCreateSchema>;

export const forbiddenActionSchema = forbiddenActionBaseSchema.extend({
  id: z.string(),
  agent_role_id: z.string(),
});
export type ForbiddenAction = z.infer<typeof forbiddenActionSchema>;
