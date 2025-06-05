import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  HandoffCriteria,
  HandoffCriteriaCreateData,
} from '@/types/handoff';

export const handoffApi = {
  async create(data: HandoffCriteriaCreateData): Promise<HandoffCriteria> {
    const response = await request<{
      success: boolean;
      criteria: HandoffCriteria;
    }>(buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/handoff/create'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.criteria;
  },

  async list(agentRoleId?: string): Promise<HandoffCriteria[]> {
    const params = new URLSearchParams();
    if (agentRoleId) params.append('agent_role_id', agentRoleId);
    const response = await request<{
      success: boolean;
      criteria: HandoffCriteria[];
    }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.MCP_TOOLS,
        `/handoff/list${params.toString() ? `?${params.toString()}` : ''}`
      )
    );
    return response.criteria;
  },

  async remove(criteriaId: string): Promise<void> {
    const params = new URLSearchParams({ criteria_id: criteriaId });
    await request<{ success: boolean }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.MCP_TOOLS,
        `/handoff/delete?${params.toString()}`
      ),
      { method: 'DELETE' }
    );
  },
};
