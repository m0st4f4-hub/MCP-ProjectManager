import { z } from "zod";

// Base schema for project template
export const projectTemplateBaseSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  template_data: z.record(z.any()),
});

// Schema for creating a new project template
export const projectTemplateCreateSchema = projectTemplateBaseSchema;
export type ProjectTemplateCreateData = z.infer<
  typeof projectTemplateCreateSchema
>;

// Schema for updating a project template
export const projectTemplateUpdateSchema = projectTemplateBaseSchema.partial();
export type ProjectTemplateUpdateData = z.infer<
  typeof projectTemplateUpdateSchema
>;

// Schema for project template returned from API
export const projectTemplateSchema = projectTemplateBaseSchema.extend({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ProjectTemplate = z.infer<typeof projectTemplateSchema>;
