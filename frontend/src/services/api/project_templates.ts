import { request } from "./request";
import { buildApiUrl } from "./config";
import {
  ProjectTemplate,
  ProjectTemplateCreateData,
  ProjectTemplateUpdateData,
} from "@/types/project_template";

export const projectTemplatesApi = {
  // Create a new project template
  create: async (data: ProjectTemplateCreateData): Promise<ProjectTemplate> => {
    return request<ProjectTemplate>(
      buildApiUrl("/project-templates/"),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  // Get all project templates
  list: async (skip = 0, limit = 100): Promise<ProjectTemplate[]> => {
    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    return request<ProjectTemplate[]>(
      buildApiUrl("/project-templates/", `?${params.toString()}`)
    );
  },

  // Get a single project template by ID
  get: async (templateId: string): Promise<ProjectTemplate> => {
    return request<ProjectTemplate>(
      buildApiUrl("/project-templates/", `/${templateId}`)
    );
  },

  // Update a project template by ID
  update: async (
    templateId: string,
    data: ProjectTemplateUpdateData,
  ): Promise<ProjectTemplate> => {
    return request<ProjectTemplate>(
      buildApiUrl("/project-templates/", `/${templateId}`),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  // Delete a project template by ID
  delete: async (templateId: string): Promise<{ message: string }> => {
    return request<{ message: string }>(
      buildApiUrl("/project-templates/", `/${templateId}`),
      {
        method: "DELETE" }
    );
  },
}; 