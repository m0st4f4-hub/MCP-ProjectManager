import { request } from "./request";
import { buildApiUrl } from "./config";
import {
  ProjectTemplate,
  ProjectTemplateCreateData,
  ProjectTemplateUpdateData,
} from "@/types/project_template";

/**
 * Thin REST wrapper for /project-templates endpoints.
 * Fully typed, portable, and encapsulated logic.
 */
export async function deleteTemplate(
  templateId: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(
    buildApiUrl("/project-templates/", `/${templateId}`),
    { method: "DELETE" },
  );
}

export const projectTemplatesApi = {
  /** Create a new project template */
  async create(data: ProjectTemplateCreateData): Promise<ProjectTemplate> {
    const { data: template } = await request<{ data: ProjectTemplate }>(buildApiUrl("/project-templates/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
    return template;
  },

  /** List project templates with basic pagination */
  async list(skip = 0, limit = 100): Promise<ProjectTemplate[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    const { data } = await request<{ data: ProjectTemplate[] }>(buildApiUrl("/project-templates/", `?${params}`));
    return data;
  },

  /** Retrieve a single project template */
  async get(templateId: string): Promise<ProjectTemplate> {
    const { data } = await request<{ data: ProjectTemplate }>(buildApiUrl("/project-templates/", `/${templateId}`));
    return data;
  },

  /** Update a project template */
  async update(
    templateId: string,
    data: ProjectTemplateUpdateData,
  ): Promise<ProjectTemplate> {
    const { data: tpl } = await request<{ data: ProjectTemplate }>(buildApiUrl("/project-templates/", `/${templateId}`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return tpl;
  },

  /** Delete a project template */
  delete: deleteTemplate,
  deleteTemplate,
};
