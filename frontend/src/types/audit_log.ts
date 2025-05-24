import { z } from "zod";

// --- Audit Log Schemas ---
export const auditLogBaseSchema = z.object({
  action: z.string(),
  user_id: z.string().nullable().optional(), // Assuming user_id is string (UUID) and optional/nullable
  timestamp: z.string(), // Backend uses datetime, can be string in frontend or converted
  details: z.record(z.any()).nullable().optional(), // Assuming details is a dictionary
});

export const auditLogSchema = auditLogBaseSchema.extend({
  id: z.string(), // Assuming UUID as string
});

export type AuditLog = z.infer<typeof auditLogSchema>;

// Schema for fetching audit logs (if backend supports pagination/filtering)
export const auditLogFiltersSchema = z.object({
  user_id: z.string().optional(),
  action: z.string().optional(),
  start_time: z.string().optional(), // Assuming ISO string format for date/time
  end_time: z.string().optional(),
  skip: z.number().optional().default(0),
  limit: z.number().optional().default(100), // Assuming a default limit
});

export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>; 