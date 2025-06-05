import { z } from 'zod';

export const errorProtocolBaseSchema = z.object({
  agent_role_id: z.string(),
  error_type: z.string().min(1, 'Error type is required'),
  protocol: z.string().min(1, 'Protocol is required'),
  priority: z.number().min(1).max(10).default(5),
  is_active: z.boolean().default(true),
});

export const errorProtocolCreateSchema = errorProtocolBaseSchema.omit({
  is_active: true,
});
export type ErrorProtocolCreateData = z.infer<typeof errorProtocolCreateSchema>;

export const errorProtocolUpdateSchema = errorProtocolBaseSchema.partial();
export type ErrorProtocolUpdateData = z.infer<typeof errorProtocolUpdateSchema>;

export const errorProtocolSchema = errorProtocolBaseSchema.extend({
  id: z.string(),
  created_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
  updated_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
});

export type ErrorProtocol = z.infer<typeof errorProtocolSchema>;
