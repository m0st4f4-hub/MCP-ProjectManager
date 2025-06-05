import { z } from 'zod';

export const verificationRequirementBaseSchema = z.object({
  agent_role_id: z.string(),
  requirement: z.string().min(1, 'Requirement is required'),
  description: z.string().nullable().optional(),
  is_mandatory: z.boolean().default(true),
});

export const verificationRequirementCreateSchema = verificationRequirementBaseSchema.omit({
  agent_role_id: true,
});

export type VerificationRequirementCreateData = z.infer<typeof verificationRequirementCreateSchema> & { agent_role_id: string };

export const verificationRequirementSchema = verificationRequirementBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type VerificationRequirement = z.infer<typeof verificationRequirementSchema>;

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
