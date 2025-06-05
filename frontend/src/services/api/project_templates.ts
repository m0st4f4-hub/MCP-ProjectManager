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
): Promise<boolean> {
  return request<boolean>(
    buildApiUrl("/project-templates/", `/${templateId}`),
    { method: "DELETE" },
  );
}

export const projectTemplatesApi = {
  /** Create a new project template */
  async create(data: ProjectTemplateCreateData): Promise<ProjectTemplate> {
    return request<ProjectTemplate>(buildApiUrl("/project-templates/"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** List project templates with basic pagination */
  async list(skip = 0, limit = 100): Promise<ProjectTemplate[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    return request<ProjectTemplate[]>(buildApiUrl("/project-templates/", `?${params}`));
  },

  /** Retrieve a single project template */
  async get(templateId: string): Promise<ProjectTemplate> {
    return request<ProjectTemplate>(buildApiUrl("/project-templates/", `/${templateId}`));
  },

  /** Update a project template */
  async update(
    templateId: string,
    data: ProjectTemplateUpdateData,
  ): Promise<ProjectTemplate> {
    return request<ProjectTemplate>(buildApiUrl("/project-templates/", `/${templateId}`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Delete a project template */
  delete: deleteTemplate,
  deleteTemplate,
};
