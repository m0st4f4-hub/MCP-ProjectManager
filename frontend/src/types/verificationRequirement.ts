import { z } from 'zod';

export const verificationRequirementBaseSchema = z.object({
  requirement: z.string().min(1, 'Requirement is required'),
  description: z.string().optional().nullable(),
  is_mandatory: z.boolean().default(true),
});

export const verificationRequirementCreateSchema = verificationRequirementBaseSchema;
export type VerificationRequirementCreateData = z.infer<typeof verificationRequirementCreateSchema>;

export const verificationRequirementUpdateSchema = verificationRequirementBaseSchema.partial();
export type VerificationRequirementUpdateData = z.infer<typeof verificationRequirementUpdateSchema>;

export const verificationRequirementSchema = verificationRequirementBaseSchema.extend({
  id: z.string(),
  agent_role_id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }).optional(),
});

export type VerificationRequirement = z.infer<typeof verificationRequirementSchema>;
