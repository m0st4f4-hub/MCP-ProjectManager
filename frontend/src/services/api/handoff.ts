import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentHandoffCriteria,
  AgentHandoffCriteriaCreateData,
  AgentHandoffCriteriaUpdateData,
  AgentHandoffCriteriaFilters,
} from '@/types/handoff';

export const handoffApi = {
  list: async (
    filters?: AgentHandoffCriteriaFilters & { skip?: number; limit?: number }
  ): Promise<AgentHandoffCriteria[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
    }
    return request<AgentHandoffCriteria[]>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.HANDOFF_CRITERIA,
        `?${params.toString()}`
      )
    );
  },

  create: async (
    data: AgentHandoffCriteriaCreateData
  ): Promise<AgentHandoffCriteria> => {
    return request<AgentHandoffCriteria>(
      buildApiUrl(API_CONFIG.ENDPOINTS.HANDOFF_CRITERIA, '/'),
      { method: 'POST', body: JSON.stringify(data) }
    );
  },

  update: async (
    id: string,
    data: AgentHandoffCriteriaUpdateData
  ): Promise<AgentHandoffCriteria> => {
    return request<AgentHandoffCriteria>(
      buildApiUrl(API_CONFIG.ENDPOINTS.HANDOFF_CRITERIA, `/${id}`),
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  delete: async (id: string): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.HANDOFF_CRITERIA, `/${id}`),
      { method: 'DELETE' }
    );
  },
};
