import { z } from "zod";

/**
 * Base (shared) schema — used by create/update operations.
 * - `name` must be non-empty.
 * - `description` is optional and nullable.
 * - `template_data` is an arbitrary key/value record.
 */
export const projectTemplateBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  template_data: z.record(z.any()),
});

/* ────────────────────────────────────────────────────────────── */
/* CRUD-specific schemas & types                                 */
/* ────────────────────────────────────────────────────────────── */

/** Schema for POST /project-templates (create) */
export const projectTemplateCreateSchema = projectTemplateBaseSchema;
export type ProjectTemplateCreateData = z.infer<typeof projectTemplateCreateSchema>;

/** Schema for PATCH/PUT /project-templates/:id (update) */
export const projectTemplateUpdateSchema = projectTemplateBaseSchema.partial();
export type ProjectTemplateUpdateData = z.infer<typeof projectTemplateUpdateSchema>;

/** Schema for objects returned by the API */
export const projectTemplateSchema = projectTemplateBaseSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type ProjectTemplate = z.infer<typeof projectTemplateSchema>;
