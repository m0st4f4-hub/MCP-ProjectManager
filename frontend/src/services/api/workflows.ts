import { request } from './request';
import { buildApiUrl } from './config';
import { Workflow, WorkflowCreateData } from '@/types/workflow';

export const workflowsApi = {
  async create(data: WorkflowCreateData): Promise<Workflow> {
    return request<Workflow>(buildApiUrl('/workflows/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async list(skip = 0, limit = 100): Promise<Workflow[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    return request<Workflow[]>(buildApiUrl('/workflows/', `?${params}`));
  },

  async delete(workflowId: string): Promise<{ message: string }> {
    return request<{ message: string }>(buildApiUrl('/workflows/', `/${workflowId}`), {
      method: 'DELETE',
    });
  },
};
