import { z } from "zod";

export const projectTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  template_data: z.record(z.any()),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type ProjectTemplate = z.infer<typeof projectTemplateSchema>;

export const projectTemplateCreateSchema = projectTemplateSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type ProjectTemplateCreate = z.infer<typeof projectTemplateCreateSchema>;

export const projectTemplateUpdateSchema = projectTemplateCreateSchema.partial();

export type ProjectTemplateUpdate = z.infer<typeof projectTemplateUpdateSchema>;
