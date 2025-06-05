import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';

export const enumApi = {
  async getTaskStatuses(): Promise<string[]> {
    return request<string[]>(
      buildApiUrl(API_CONFIG.ENDPOINTS.ENUMS, '/task-status')
    );
  },
};
