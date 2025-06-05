import { z } from 'zod';

export const capabilityBaseSchema = z.object({
  agent_role_id: z.string(),
  capability: z.string().min(1, 'Capability is required'),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const capabilityCreateSchema = capabilityBaseSchema.omit({
  agent_role_id: true,
});
export type CapabilityCreateData = z.infer<typeof capabilityCreateSchema> & {
  agent_role_id: string;
};

export const capabilitySchema = capabilityBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type Capability = z.infer<typeof capabilitySchema>;

export interface CapabilityResponse {
  data: Capability;
  error?: { code: string; message: string; field?: string };
}

export interface CapabilityListResponse {
  data: Capability[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}
