import { z } from "zod";

// --- User Schemas ---
export const userBaseSchema = z.object({
  username: z.string(),
});

export const userCreateSchema = userBaseSchema.extend({
  password: z.string(),
});

export type UserCreateData = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userBaseSchema.partial().extend({
  password: z.string().optional(),
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;

export const userSchema = userBaseSchema.extend({
  id: z.string(),
  is_active: z.boolean(), // Assuming is_active exists based on common patterns
});

export type User = z.infer<typeof userSchema>;

// --- Login Schemas ---
export const loginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// The backend /users/token returns a message and the user object
export const loginResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>; 