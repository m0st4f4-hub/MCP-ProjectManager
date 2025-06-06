import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  ErrorProtocol,
  ErrorProtocolCreateData,
  ErrorProtocolUpdateData,
  ErrorProtocolFilters,
  RuleResponse,
  RuleListResponse,
} from '@/types';

export const errorProtocolsApi = {
  async list(
    filters?: ErrorProtocolFilters & { skip?: number; limit?: number }
  ): Promise<RuleListResponse<ErrorProtocol>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return request<RuleListResponse<ErrorProtocol>>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/violations/error-protocols?${params.toString()}`
      )
    );
  },

  async create(data: ErrorProtocolCreateData): Promise<ErrorProtocol> {
    const response = await request<RuleResponse<ErrorProtocol>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/violations/error-protocols'),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async update(
    protocolId: string,
    data: ErrorProtocolUpdateData
  ): Promise<ErrorProtocol> {
    const response = await request<RuleResponse<ErrorProtocol>>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/violations/error-protocols/${protocolId}`
      ),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async delete(protocolId: string): Promise<void> {
    await request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/violations/error-protocols/${protocolId}`
      ),
      { method: 'DELETE' }
    );
  },
};
