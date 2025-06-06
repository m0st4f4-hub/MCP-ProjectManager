import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentForbiddenAction,
  AgentForbiddenActionCreateData,
  AgentForbiddenActionUpdateData,
  AgentForbiddenActionResponse,
} from '@/types/agents';

/**
 * CRUD wrapper for agent forbidden actions endpoints.
 */
export const forbiddenActionsApi = {
  /** Create a forbidden action for an agent role */
  async create(
    roleId: string,
    data: AgentForbiddenActionCreateData,
  ): Promise<AgentForbiddenAction> {
    const { data: action } = await request<{ data: AgentForbiddenAction }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${roleId}/forbidden-actions`,
      ),
      }
    );
    return action;
  },

  /** Retrieve forbidden actions for a role */
  async list(roleId: string): Promise<AgentForbiddenAction[]> {
    const { data } = await request<{ data: AgentForbiddenAction[] }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${roleId}/forbidden-actions`,
      ),
    );
    return data;
  },

  /** Get a single forbidden action by ID */
  async get(actionId: string): Promise<AgentForbiddenAction> {
    const { data } = await request<{ data: AgentForbiddenAction }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/forbidden-actions/${actionId}`,
      ),
    );
    return data;
  },

  /** Update a forbidden action */
  async update(
    actionId: string,
    data: AgentForbiddenActionUpdateData,
  ): Promise<AgentForbiddenAction> {
    const { data } = await request<{ data: AgentForbiddenAction }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/forbidden-actions/${actionId}`,
      ),
      { method: 'PUT', body: JSON.stringify(data) },
    );
    return data;
  },

  /** Delete a forbidden action */
  async delete(actionId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/forbidden-actions/${actionId}`
      ),
      { method: 'DELETE' }
    );
  },
};
