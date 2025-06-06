import { z } from 'zod';

export const agentRoleBaseSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  primary_purpose: z.string(),
  is_active: z.boolean().default(true),
});

export const agentRoleCreateSchema = agentRoleBaseSchema;
export type AgentRoleCreateData = z.infer<typeof agentRoleCreateSchema>;

export const agentRoleUpdateSchema = agentRoleBaseSchema.partial();
export type AgentRoleUpdateData = z.infer<typeof agentRoleUpdateSchema>;

export const agentRoleSchema = agentRoleBaseSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AgentRole = z.infer<typeof agentRoleSchema>;

export interface AgentRoleResponse {
  data: AgentRole;
}

export interface AgentRoleListResponse {
  data: AgentRole[];
  total: number;
  page: number;
  pageSize: number;
}
