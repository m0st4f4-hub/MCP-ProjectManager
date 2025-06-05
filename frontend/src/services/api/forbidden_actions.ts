import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentForbiddenAction,
  AgentForbiddenActionCreateData,
  AgentForbiddenActionResponse,
} from '@/types';

/**
 * CRUD wrapper for agent role forbidden actions endpoints.
 */
export const forbiddenActionsApi = {
  /** Add a forbidden action to an agent role */
  async create(
    agentRoleId: string,
    data: AgentForbiddenActionCreateData
  ): Promise<AgentForbiddenAction> {
    const response = await request<AgentForbiddenActionResponse>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/${agentRoleId}/forbidden-actions`
      ),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  /** Remove a forbidden action by ID */
  async delete(actionId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/forbidden-actions/${actionId}`),
      { method: 'DELETE' }
    );
  },
};
