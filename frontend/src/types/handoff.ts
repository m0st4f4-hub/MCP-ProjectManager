import { z } from 'zod';

export const agentHandoffCriteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string(),
  description: z.string().optional().nullable(),
  target_agent_role: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const agentHandoffCriteriaCreateSchema = agentHandoffCriteriaBaseSchema;
export type AgentHandoffCriteriaCreateData = z.infer<
  typeof agentHandoffCriteriaCreateSchema
>;

export const agentHandoffCriteriaUpdateSchema = agentHandoffCriteriaBaseSchema
  .partial()
  .omit({ agent_role_id: true });
export type AgentHandoffCriteriaUpdateData = z.infer<
  typeof agentHandoffCriteriaUpdateSchema
>;

export const agentHandoffCriteriaSchema = agentHandoffCriteriaBaseSchema.extend(
  {
    id: z.string(),
    created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  }
);
export type AgentHandoffCriteria = z.infer<typeof agentHandoffCriteriaSchema>;

export interface AgentHandoffCriteriaFilters {
  agent_role_id?: string;
  is_active?: boolean;
  search?: string;
}
