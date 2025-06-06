import { request } from './request';
import { buildApiUrl } from './config';
import {
  ProjectTemplate,
  ProjectTemplateCreateData,
  ProjectTemplateUpdateData,
} from '@/types/project_template';

interface ProjectTemplateListParams {
  skip?: number;
  limit?: number;
  search?: string;
  is_archived?: boolean | null;
}

interface ProjectTemplateListResponse {
  data: ProjectTemplate[];
  total: number;
}

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

// Project Templates API functions
export const projectTemplatesApi = {
  async list(skip = 0, limit = 50, search?: string, is_archived?: boolean | null): Promise<ProjectTemplateListResponse> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (is_archived !== null && is_archived !== undefined) {
      params.append('is_archived', is_archived.toString());
    }

    const url = buildApiUrl('project-templates', `?${params.toString()}`);
    return request(url, {
      method: 'GET',
    });
  },

  async get(id: string): Promise<ProjectTemplate> {
    const url = buildApiUrl(`project-templates/${id}`);
    return request(url, {
      method: 'GET',
    });
  },

  async create(data: ProjectTemplateCreateData): Promise<ProjectTemplate> {
    const url = buildApiUrl('project-templates');
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: ProjectTemplateUpdateData): Promise<ProjectTemplate> {
    const url = buildApiUrl(`project-templates/${id}`);
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    const url = buildApiUrl(`project-templates/${id}`);
    return request(url, {
      method: 'DELETE',
    });
  },

  async archive(id: string): Promise<ProjectTemplate> {
    const url = buildApiUrl(`project-templates/${id}/archive`);
    return request(url, {
      method: 'POST',
    });
  },

  async unarchive(id: string): Promise<ProjectTemplate> {
    const url = buildApiUrl(`project-templates/${id}/unarchive`);
    return request(url, {
      method: 'POST',
    });
  },

  async duplicate(id: string, name?: string): Promise<ProjectTemplate> {
    const url = buildApiUrl(`project-templates/${id}/duplicate`);
    const body = name ? JSON.stringify({ name }) : undefined;
    return request(url, {
      method: 'POST',
      body,
    });
  },
};

/**
 * Convenience wrapper for deleting a project template by ID.
 */
export const deleteTemplate = async (
  templateId: string
): Promise<{ message: string }> => {
  return projectTemplatesApi.delete(templateId);
};

/**
 * Delete a project template by ID
 * Alias to `projectTemplatesApi.delete` for convenience
 */
export const deleteTemplate = async (
  templateId: string
): Promise<{ message: string }> => projectTemplatesApi.delete(templateId);
