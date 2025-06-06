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
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type ErrorProtocol = z.infer<typeof errorProtocolSchema>;

// --- Agent Capability Schemas ---
export const agentCapabilityBaseSchema = z.object({
  agent_role_id: z.string(),
  capability: z.string(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const agentCapabilityCreateSchema = agentCapabilityBaseSchema.omit({
  agent_role_id: true,
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

// --- Agent Forbidden Action Schemas ---
export const agentForbiddenActionBaseSchema = z.object({
  agent_role_id: z.string(),
  action: z.string(),
  reason: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const agentForbiddenActionCreateSchema =
  agentForbiddenActionBaseSchema.omit({ agent_role_id: true });
export type AgentForbiddenActionCreateData = z.infer<
  typeof agentForbiddenActionCreateSchema
>;

export const agentForbiddenActionUpdateSchema = agentForbiddenActionBaseSchema
  .partial()
  .omit({ agent_role_id: true });
export type AgentForbiddenActionUpdateData = z.infer<
  typeof agentForbiddenActionUpdateSchema
>;

export const agentForbiddenActionSchema = agentForbiddenActionBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type AgentForbiddenAction = z.infer<typeof agentForbiddenActionSchema>;

export interface AgentForbiddenActionResponse {
  data: AgentForbiddenAction;
  error?: { code: string; message: string; field?: string };
}

export interface AgentForbiddenActionListResponse {
  data: AgentForbiddenAction[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

// --- Agent Handoff Criteria Schemas ---
export const agentHandoffCriteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string().min(1, 'Criteria is required'),
  description: z.string().nullable().optional(),
  target_agent_role: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const agentHandoffCriteriaCreateSchema = agentHandoffCriteriaBaseSchema;
export type AgentHandoffCriteriaCreateData = z.infer<
  typeof agentHandoffCriteriaCreateSchema
>;

export const agentHandoffCriteriaSchema = agentHandoffCriteriaBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type AgentHandoffCriteria = z.infer<typeof agentHandoffCriteriaSchema>;

export interface AgentHandoffCriteriaResponse {
  success: boolean;
  criteria: AgentHandoffCriteria;
}

export interface AgentHandoffCriteriaListResponse {
  success: boolean;
  criteria: AgentHandoffCriteria[];
}

// --- Agent Prompt Template Schemas ---
export const agentPromptTemplateBaseSchema = z.object({
  agent_role_id: z.string(),
  name: z.string().min(1, 'Name is required'),
  template: z.string().min(1, 'Template is required'),
  description: z.string().optional().nullable(),
  variables: z.array(z.string()).optional().default([]),
  is_active: z.boolean().default(true),
});

export const agentPromptTemplateCreateSchema = agentPromptTemplateBaseSchema;
export type AgentPromptTemplateCreateData = z.infer<
  typeof agentPromptTemplateCreateSchema
>;

export const agentPromptTemplateUpdateSchema = agentPromptTemplateBaseSchema
  .partial()
  .omit({ agent_role_id: true });
export type AgentPromptTemplateUpdateData = z.infer<
  typeof agentPromptTemplateUpdateSchema
>;

export const agentPromptTemplateSchema = agentPromptTemplateBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type AgentPromptTemplate = z.infer<typeof agentPromptTemplateSchema>;

export interface AgentPromptTemplateResponse {
  data: AgentPromptTemplate;
  error?: { code: string; message: string; field?: string };
}

export interface AgentPromptTemplateListResponse {
  data: AgentPromptTemplate[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

// --- Common Agent Types ---
export interface AgentMetrics {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  average_completion_time: number;
  success_rate: number;
}

export interface AgentHealth {
  status: 'healthy' | 'warning' | 'error';
  last_seen: string;
  uptime: number;
  error_count: number;
  warning_count: number;
}

export interface AgentConfiguration {
  max_concurrent_tasks: number;
  timeout_seconds: number;
  retry_count: number;
  priority: number;
  resource_limits: {
    memory_mb: number;
    cpu_percent: number;
  };
}

// --- Agent State and Status ---
export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance';

export interface AgentState {
  id: string;
  status: AgentStatus;
  current_task_id?: string;
  last_activity: string;
  metrics: AgentMetrics;
  health: AgentHealth;
  configuration: AgentConfiguration;
}
