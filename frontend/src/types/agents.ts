import { z } from 'zod';

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// --- Agent Handoff Criteria Schemas ---
export const agentHandoffCriteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string(),
=======
export const criteriaBaseSchema = z.object({
  agent_role_id: z.string(),
  criteria: z.string().min(1, 'Criteria is required'),
>>>>>>> origin/codex/add-crud-functions-and-typescript-interfaces
  description: z.string().nullable().optional(),
  target_agent_role: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

<<<<<<< HEAD
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

=======
>>>>>>> origin/16bcjg-codex/implement-crud-for-error-protocols
// --- Error Protocol Schemas ---
export const errorProtocolBaseSchema = z.object({
  agent_role_id: z.string(),
  error_type: z.string(),
  protocol: z.string(),
<<<<<<< HEAD
  priority: z.number().optional(),
=======
  priority: z.number().min(1).max(10).default(5),
>>>>>>> origin/16bcjg-codex/implement-crud-for-error-protocols
  is_active: z.boolean().default(true),
});

export const errorProtocolCreateSchema = errorProtocolBaseSchema;
export type ErrorProtocolCreateData = z.infer<typeof errorProtocolCreateSchema>;

<<<<<<< HEAD
export const errorProtocolUpdateSchema = errorProtocolBaseSchema.partial();
=======
export const errorProtocolUpdateSchema = errorProtocolBaseSchema
  .partial()
  .omit({
    agent_role_id: true,
  });
>>>>>>> origin/16bcjg-codex/implement-crud-for-error-protocols
export type ErrorProtocolUpdateData = z.infer<typeof errorProtocolUpdateSchema>;

export const errorProtocolSchema = errorProtocolBaseSchema.extend({
  id: z.string(),
<<<<<<< HEAD
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type ErrorProtocol = z.infer<typeof errorProtocolSchema>;

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

=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
// --- Agent Capability Schemas ---
export const agentCapabilityBaseSchema = z.object({
  agent_role_id: z.string(),
  capability: z.string(),
<<<<<<< HEAD
<<<<<<< HEAD
  description: z.string().nullable().optional(),
=======
  description: z.string().optional().nullable(),
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
=======
  description: z.string().optional().nullable(),
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
  is_active: z.boolean().default(true),
});

export const agentCapabilityCreateSchema = agentCapabilityBaseSchema.omit({
<<<<<<< HEAD
<<<<<<< HEAD
  agent_role_id: true,
});
=======
  is_active: true,
});

>>>>>>> origin/codex/add-agent-capabilities-crud-functions
=======
  is_active: true,
});

>>>>>>> origin/codex/add-agent-capabilities-crud-functions
export type AgentCapabilityCreateData = z.infer<
  typeof agentCapabilityCreateSchema
>;

export const agentCapabilityUpdateSchema = agentCapabilityBaseSchema
  .partial()
<<<<<<< HEAD
<<<<<<< HEAD
  .omit({ agent_role_id: true });
=======
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
  .omit({
    agent_role_id: true,
  });

<<<<<<< HEAD
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
export type AgentCapabilityUpdateData = z.infer<
  typeof agentCapabilityUpdateSchema
>;

export const agentCapabilitySchema = agentCapabilityBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
<<<<<<< HEAD
<<<<<<< HEAD
export type AgentCapability = z.infer<typeof agentCapabilitySchema>;

export interface AgentCapabilityResponse {
  data: AgentCapability;
  error?: unknown;
=======
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions

export type AgentCapability = z.infer<typeof agentCapabilitySchema>;

// --- Agent Capability API Response Types ---
export interface AgentCapabilityResponse {
  data: AgentCapability;
  error?: { code: string; message: string; field?: string };
<<<<<<< HEAD
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
}

export interface AgentCapabilityListResponse {
  data: AgentCapability[];
  total: number;
  page: number;
  pageSize: number;
<<<<<<< HEAD
<<<<<<< HEAD
  error?: unknown;
}
<<<<<<< HEAD

// --- Verification Requirement Schemas ---
export const verificationRequirementBaseSchema = z.object({
  agent_role_id: z.string(),
  requirement: z.string().min(1, 'Requirement is required'),
  description: z.string().nullable().optional(),
  is_mandatory: z.boolean().default(true),
});

export const verificationRequirementCreateSchema =
  verificationRequirementBaseSchema.omit({ agent_role_id: true });

export type VerificationRequirementCreateData = z.infer<
  typeof verificationRequirementCreateSchema
>;

export const verificationRequirementUpdateSchema =
  verificationRequirementBaseSchema.partial().omit({ agent_role_id: true });

export type VerificationRequirementUpdateData = z.infer<
  typeof verificationRequirementUpdateSchema
>;

export const verificationRequirementSchema =
  verificationRequirementBaseSchema.extend({
    id: z.string(),
    created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  });

export type VerificationRequirement = z.infer<
  typeof verificationRequirementSchema
>;

export interface VerificationRequirementResponse {
  data: VerificationRequirement;
  error?: { code: string; message: string; field?: string };
}

export interface VerificationRequirementListResponse {
  data: VerificationRequirement[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}
=======
=======
export const criteriaCreateSchema = criteriaBaseSchema.omit({
  is_active: true,
});

export type CriteriaCreateData = z.infer<typeof criteriaCreateSchema>;

export const criteriaUpdateSchema = criteriaBaseSchema.partial();

export type CriteriaUpdateData = z.infer<typeof criteriaUpdateSchema>;

export const criteriaSchema = criteriaBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type Criteria = z.infer<typeof criteriaSchema>;
>>>>>>> origin/codex/add-crud-functions-and-typescript-interfaces
<<<<<<< HEAD
>>>>>>> 923023da617a254682cf1eb7264238cc87c3f3e1
=======
=======
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
  error?: { code: string; message: string; field?: string };
}

export interface AgentCapabilityFilters {
  agent_role_id?: string;
  is_active?: boolean;
  search?: string;
}
<<<<<<< HEAD
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
<<<<<<< HEAD
>>>>>>> da7a1f9acfd28696eab90063aaf41536496c5662
=======
=======
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
>>>>>>> origin/16bcjg-codex/implement-crud-for-error-protocols
<<<<<<< HEAD
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
=======
=======
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
