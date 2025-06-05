import { z } from 'zod';

// --- Verification Requirement Schemas ---
export const verificationRequirementBaseSchema = z.object({
  agent_role_id: z.string(),
  requirement: z.string(),
  description: z.string().nullable().optional(),
  is_mandatory: z.boolean().default(true),
});

export const verificationRequirementCreateSchema = verificationRequirementBaseSchema.omit({
  agent_role_id: true,
});
export type VerificationRequirementCreateData = z.infer<typeof verificationRequirementCreateSchema>;

export const verificationRequirementUpdateSchema = verificationRequirementBaseSchema.partial().omit({
  agent_role_id: true,
});
export type VerificationRequirementUpdateData = z.infer<typeof verificationRequirementUpdateSchema>;

export const verificationRequirementSchema = verificationRequirementBaseSchema.extend({
  id: z.string(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});
export type VerificationRequirement = z.infer<typeof verificationRequirementSchema>;
