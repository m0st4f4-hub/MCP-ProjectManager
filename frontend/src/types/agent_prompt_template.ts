import { z } from "zod";

export const agentPromptTemplateBaseSchema = z.object({
  template_name: z.string(),
  template_content: z.string(),
  context_requirements: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const agentPromptTemplateCreateSchema = agentPromptTemplateBaseSchema.extend({
  agent_role_id: z.string(),
});
export type AgentPromptTemplateCreateData = z.infer<typeof agentPromptTemplateCreateSchema>;

export const agentPromptTemplateUpdateSchema = agentPromptTemplateBaseSchema.partial();
export type AgentPromptTemplateUpdateData = z.infer<typeof agentPromptTemplateUpdateSchema>;

export const agentPromptTemplateSchema = agentPromptTemplateBaseSchema.extend({
  id: z.string(),
  agent_role_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AgentPromptTemplate = z.infer<typeof agentPromptTemplateSchema>;
