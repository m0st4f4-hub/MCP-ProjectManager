import { z } from 'zod';
import { UserRole } from './user';

// --- User Role Schemas ---
export const userRoleBaseSchema = z.object({
  user_id: z.string(),
  role_name: z.nativeEnum(UserRole),
});

export type UserRoleAssociation = z.infer<typeof userRoleBaseSchema>;

export const userRoleCreateSchema = userRoleBaseSchema;

export type UserRoleCreateData = z.infer<typeof userRoleCreateSchema>;
