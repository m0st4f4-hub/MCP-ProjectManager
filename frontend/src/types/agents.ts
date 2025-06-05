import { z } from 'zod';

// --- Agent Handoff Criteria Schemas ---
export const agentHandoffCriteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string(),
  description: z.string().nullable().optional(),
  target_agent_role: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const agentHandoffCriteriaCreateSchema = agentHandoffCriteriaBaseSchema;
export type AgentHandoffCriteriaCreateData = z.infer<
  typeof agentHandoffCriteriaCreateSchema
>;

export const agentHandoffCriteriaSchema = agentHandoffCriteriaBaseSchema.extend(
  {
    id: z.string(),
    created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  }
);

export type AgentHandoffCriteria = z.infer<typeof agentHandoffCriteriaSchema>;

export interface AgentHandoffCriteriaResponse {
  success: boolean;
  criteria: AgentHandoffCriteria;
}

export interface AgentHandoffCriteriaListResponse {
  success: boolean;
  criteria: AgentHandoffCriteria[];
}

// --- Error Protocol Schemas ---
export const errorProtocolBaseSchema = z.object({
  agent_role_id: z.string(),
  error_type: z.string(),
  protocol: z.string(),
  priority: z.number().optional(),
  is_active: z.boolean().default(true),
});

export const errorProtocolCreateSchema = errorProtocolBaseSchema;
export type ErrorProtocolCreateData = z.infer<typeof errorProtocolCreateSchema>;

export const errorProtocolUpdateSchema = errorProtocolBaseSchema.partial();
export type ErrorProtocolUpdateData = z.infer<typeof errorProtocolUpdateSchema>;

export const errorProtocolSchema = errorProtocolBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type ErrorProtocol = z.infer<typeof errorProtocolSchema>;
