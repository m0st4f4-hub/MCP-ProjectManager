import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import { StatusTransition } from '@/types/statusTransition';
import { TaskStatus } from '@/types/task';

export const statusTransitionsApi = {
  async list(): Promise<StatusTransition[]> {
    return request<StatusTransition[]>(buildApiUrl(API_CONFIG.ENDPOINTS.STATUS_TRANSITIONS));
  },
  async create(from_status: TaskStatus, to_status: TaskStatus): Promise<StatusTransition> {
    return request<StatusTransition>(buildApiUrl(API_CONFIG.ENDPOINTS.STATUS_TRANSITIONS), {
      method: 'POST',
      body: JSON.stringify({ from_status, to_status }),
    });
  },
  async remove(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(buildApiUrl(API_CONFIG.ENDPOINTS.STATUS_TRANSITIONS, `/${id}`), {
      method: 'DELETE',
    });
  },
};
