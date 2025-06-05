import { z } from 'zod';

// --- Universal Mandate Schemas ---
export const universalMandateBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  priority: z.number().min(1).max(10).default(5),
  is_active: z.boolean().default(true),
  category: z.string().nullable().optional(),
});

export const universalMandateCreateSchema = universalMandateBaseSchema;

export type UniversalMandateCreateData = z.infer<
  typeof universalMandateCreateSchema
>;

export const universalMandateUpdateSchema =
  universalMandateBaseSchema.partial();

export type UniversalMandateUpdateData = z.infer<
  typeof universalMandateUpdateSchema
>;

export const universalMandateSchema = universalMandateBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
});

export type UniversalMandate = z.infer<typeof universalMandateSchema>;

export interface UniversalMandateResponse {
  data: UniversalMandate;
  error?: { code: string; message: string; field?: string };
}

export interface UniversalMandateListResponse {
  data: UniversalMandate[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

// --- Agent Rule Schemas ---
export const ruleAgentRuleBaseSchema = z.object({
  agent_id: z.string(),
  rule_type: z.string().min(1, 'Rule type is required'),
  rule_content: z.string().min(1, 'Rule content is required'),
  is_active: z.boolean().default(true),
});

export const ruleAgentRuleCreateSchema = ruleAgentRuleBaseSchema.omit({
  agent_id: true,
});

export type AgentRuleCreateData = z.infer<typeof ruleAgentRuleCreateSchema>;

export const ruleAgentRuleUpdateSchema = ruleAgentRuleBaseSchema
  .partial()
  .omit({ agent_id: true });

export type AgentRuleUpdateData = z.infer<typeof ruleAgentRuleUpdateSchema>;

export const ruleAgentRuleSchema = ruleAgentRuleBaseSchema.extend({
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

export type RuleAgentRule = z.infer<typeof ruleAgentRuleSchema>;

// --- Rule API Response Types ---
export interface RuleResponse<T> {
  data: T;
  error?: { code: string; message: string; field?: string };
}

export interface RuleListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

// --- Rule Filter Types ---
export interface UniversalMandateFilters {
  is_active?: boolean;
  category?: string;
  priority_min?: number;
  priority_max?: number;
  search?: string;
}

export interface AgentRuleFilters {
  agent_id?: string;
  rule_type?: string;
  is_active?: boolean;
  search?: string;
}
