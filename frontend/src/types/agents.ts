import { z } from 'zod';

// --- Error Protocol Schemas ---
export const errorProtocolBaseSchema = z.object({
  agent_role_id: z.string(),
  error_type: z.string(),
  protocol: z.string(),
  priority: z.number().min(1).max(10).default(5),
  is_active: z.boolean().default(true),
});

export const errorProtocolCreateSchema = errorProtocolBaseSchema;
export type ErrorProtocolCreateData = z.infer<typeof errorProtocolCreateSchema>;

export const errorProtocolUpdateSchema = errorProtocolBaseSchema
  .partial()
  .omit({
    agent_role_id: true,
  });
export type ErrorProtocolUpdateData = z.infer<typeof errorProtocolUpdateSchema>;

export const errorProtocolSchema = errorProtocolBaseSchema.extend({
  id: z.string(),
  created_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
});
export type ErrorProtocol = z.infer<typeof errorProtocolSchema>;

export interface ErrorProtocolFilters {
  agent_role_id?: string;
  error_type?: string;
  is_active?: boolean;
}
