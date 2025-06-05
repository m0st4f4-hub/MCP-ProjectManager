import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  ErrorProtocol,
  ErrorProtocolCreateData,
  ErrorProtocolUpdateData,
} from '@/types/error_protocol';

export const errorProtocolsApi = {
  list: async (): Promise<ErrorProtocol[]> => {
    return await request<ErrorProtocol[]>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/error-protocols')
    );
  },
  create: async (data: ErrorProtocolCreateData): Promise<ErrorProtocol> => {
    return await request<ErrorProtocol>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/error-protocols'),
      { method: 'POST', body: JSON.stringify(data) }
    );
  },
  update: async (
    id: string,
    data: ErrorProtocolUpdateData
  ): Promise<ErrorProtocol> => {
    return await request<ErrorProtocol>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/error-protocols/${id}`),
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },
  remove: async (id: string): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/error-protocols/${id}`),
      { method: 'DELETE' }
    );
  },
};
