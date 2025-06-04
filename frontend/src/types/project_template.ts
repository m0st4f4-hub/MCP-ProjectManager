import { z } from "zod";

/**
 * Base schema shared across all operations (create/update/read).
 * - `name`: required, non-empty string
 * - `description`: optional, nullable string
 * - `template_data`: flexible key-value JSON
 */
export const projectTemplateBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  template_data: z.record(z.any()),
});

/* ────────────────────────────────────────────────────────────── */
/* CRUD-Specific Schemas                                          */
/* ────────────────────────────────────────────────────────────── */

/** Schema for POST /project-templates */
export const projectTemplateCreateSchema = projectTemplateBaseSchema;
export type ProjectTemplateCreateData = z.infer<typeof projectTemplateCreateSchema>;

/** Schema for PUT/PATCH /project-templates/:id */
export const projectTemplateUpdateSchema = projectTemplateBaseSchema.partial();
export type ProjectTemplateUpdateData = z.infer<typeof projectTemplateUpdateSchema>;

/** Schema for objects returned from the API */
export const projectTemplateSchema = projectTemplateBaseSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type ProjectTemplate = z.infer<typeof projectTemplateSchema>;
