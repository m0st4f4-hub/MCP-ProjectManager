import { request } from './request';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { buildApiUrl, API_CONFIG } from './config';
=======
import { buildApiUrl } from './config';
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
=======
import { buildApiUrl } from './config';
>>>>>>> origin/codex/add-deletetemplate-to-api-project_templates
=======
import { buildApiUrl } from './config';
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
import {
  ProjectTemplate,
  ProjectTemplateCreateData,
  ProjectTemplateUpdateData,
} from '@/types/project_template';

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
<<<<<<< HEAD
    return request<ProjectTemplate>(buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TEMPLATES), {
      method: 'POST',
      body: JSON.stringify(data),
    });
=======
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    return request<ProjectTemplate>(
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TEMPLATES),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
=======
=======
>>>>>>> origin/codex/add-deletetemplate-to-api-project_templates
=======
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
    return request<ProjectTemplate>(buildApiUrl('/project-templates/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
  },

  /** List project templates with basic pagination */
  async list(skip = 0, limit = 100): Promise<ProjectTemplate[]> {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    return request<ProjectTemplate[]>(
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TEMPLATES, `?${params}`)
=======
      buildApiUrl('/project-templates/', `?${params}`)
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
=======
      buildApiUrl('/project-templates/', `?${params}`)
>>>>>>> origin/codex/add-deletetemplate-to-api-project_templates
=======
      buildApiUrl('/project-templates/', `?${params}`)
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
    );
  },

  /** Retrieve a single project template */
  async get(templateId: string): Promise<ProjectTemplate> {
    return request<ProjectTemplate>(
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TEMPLATES, `/${templateId}`)
=======
      buildApiUrl('/project-templates/', `/${templateId}`)
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
=======
      buildApiUrl('/project-templates/', `/${templateId}`)
>>>>>>> origin/codex/add-deletetemplate-to-api-project_templates
=======
      buildApiUrl('/project-templates/', `/${templateId}`)
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
    );
  },

  /** Update a project template */
  async update(
    templateId: string,
    data: ProjectTemplateUpdateData
  ): Promise<ProjectTemplate> {
    return request<ProjectTemplate>(
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TEMPLATES, `/${templateId}`),
=======
      buildApiUrl('/project-templates/', `/${templateId}`),
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
=======
      buildApiUrl('/project-templates/', `/${templateId}`),
>>>>>>> origin/codex/add-deletetemplate-to-api-project_templates
=======
      buildApiUrl('/project-templates/', `/${templateId}`),
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /** Delete a project template */
<<<<<<< HEAD
  async delete(templateId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TEMPLATES, `/${templateId}`),
=======
<<<<<<< HEAD
  delete: deleteTemplate,
  deleteTemplate,
=======
  async delete(templateId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl('/project-templates/', `/${templateId}`),
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
      {
        method: 'DELETE',
      }
    );
  },
<<<<<<< HEAD
};

/**
=======
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
};

/**
 * Convenience wrapper for deleting a project template by ID.
 */
export const deleteTemplate = async (
  templateId: string
): Promise<{ message: string }> => {
  return projectTemplatesApi.delete(templateId);
};
<<<<<<< HEAD

/**
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
 * Delete a project template by ID
 * Alias to `projectTemplatesApi.delete` for convenience
 */
export const deleteTemplate = async (
  templateId: string
): Promise<{ message: string }> => projectTemplatesApi.delete(templateId);
=======
>>>>>>> origin/codex/add-deletetemplate-function-to-project_templates
