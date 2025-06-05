import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentForbiddenAction,
  AgentForbiddenActionCreateData,
  AgentForbiddenActionUpdateData,
} from '@/types/agents';

/**
 * Thin REST wrapper for agent forbidden actions endpoints.
 */
export const forbiddenActionsApi = {
  /** Create a forbidden action for an agent role */
  async create(
    roleId: string,
    data: AgentForbiddenActionCreateData,
  ): Promise<AgentForbiddenAction> {
    return request<AgentForbiddenAction>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${roleId}/forbidden-actions`,
      ),
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  },

  /** Retrieve forbidden actions for a role */
  async list(roleId: string): Promise<AgentForbiddenAction[]> {
    return request<AgentForbiddenAction[]>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${roleId}/forbidden-actions`,
      ),
    );
  },

  /** Get a single forbidden action by ID */
  async get(actionId: string): Promise<AgentForbiddenAction> {
    return request<AgentForbiddenAction>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/forbidden-actions/${actionId}`,
      ),
    );
  },

  /** Update a forbidden action */
  async update(
    actionId: string,
    data: AgentForbiddenActionUpdateData,
  ): Promise<AgentForbiddenAction> {
    return request<AgentForbiddenAction>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/forbidden-actions/${actionId}`,
      ),
      { method: 'PUT', body: JSON.stringify(data) },
    );
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
