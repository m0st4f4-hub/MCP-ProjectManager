import { z } from 'zod';
import { UserRoleEnum as UserRole } from './generated';

// Define a schema for the UserRole object returned by the backend
export const userRoleObjectSchema = z.object({
  user_id: z.string(),
  role_name: z.nativeEnum(UserRole), // Matches backend UserRoleEnum values
});

export type UserRoleObject = z.infer<typeof userRoleObjectSchema>;

// --- User Schemas ---
export const userBaseSchema = z.object({
  username: z.string(),
  email: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  disabled: z.boolean().default(false),
});

export const userCreateSchema = userBaseSchema.extend({
  password: z.string(),
  email: z.string().email(),
  roles: z.array(z.nativeEnum(UserRole)).default([]),
});

export type UserCreateData = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userBaseSchema.partial().extend({
  password: z.string().optional(),
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;

export const userSchema = userBaseSchema.extend({
  id: z.string(),
  user_roles: z.array(userRoleObjectSchema).default([]),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
});

export type User = z.infer<typeof userSchema>;

// --- Login Schemas ---
export const loginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// The backend /users/token returns a message and the user object
export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
