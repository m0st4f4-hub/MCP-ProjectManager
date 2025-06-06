import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  Workflow,
  WorkflowCreateData,
  WorkflowUpdateData,
} from '@/types/workflow';

export const workflowsApi = {
  async list(filters?: {
    workflow_type?: string;
    active_only?: boolean;
  }): Promise<Workflow[]> {
    const params = new URLSearchParams();
    if (filters?.workflow_type)
      params.append('workflow_type', filters.workflow_type);
    if (filters?.active_only !== undefined) {
      params.append('active_only', String(filters.active_only));
    }
    const query = params.toString();
    return request<Workflow[]>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/workflows${query ? `?${query}` : ''}`
      )
    );
  },

  async get(id: string): Promise<Workflow> {
    return request<Workflow>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/workflows/${id}`)
    );
  },

  async create(data: WorkflowCreateData): Promise<Workflow> {
    return request<Workflow>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/workflows'),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async update(id: string, data: WorkflowUpdateData): Promise<Workflow> {
    return request<Workflow>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/workflows/${id}`),
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/workflows/${id}`),
      { method: 'DELETE' }
    );
  },
};
