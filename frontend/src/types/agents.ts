import { z } from 'zod';

// --- Agent Capability Schemas ---
export const agentCapabilityBaseSchema = z.object({
  agent_role_id: z.string(),
  capability: z.string(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const agentCapabilityCreateSchema = agentCapabilityBaseSchema.omit({
  is_active: true,
});

export type AgentCapabilityCreateData = z.infer<
  typeof agentCapabilityCreateSchema
>;

export const agentCapabilityUpdateSchema = agentCapabilityBaseSchema
  .partial()
  .omit({
    agent_role_id: true,
  });

export type AgentCapabilityUpdateData = z.infer<
  typeof agentCapabilityUpdateSchema
>;

export const agentCapabilitySchema = agentCapabilityBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type AgentCapability = z.infer<typeof agentCapabilitySchema>;

// --- Agent Capability API Response Types ---
export interface AgentCapabilityResponse {
  data: AgentCapability;
  error?: { code: string; message: string; field?: string };
}

export interface AgentCapabilityListResponse {
  data: AgentCapability[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

export interface AgentCapabilityFilters {
  agent_role_id?: string;
  is_active?: boolean;
  search?: string;
}
