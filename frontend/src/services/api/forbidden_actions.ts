import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentForbiddenAction,
  AgentForbiddenActionCreateData,
<<<<<<< HEAD
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
    const { data: action } = await request<{ data: AgentForbiddenAction }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${roleId}/forbidden-actions`,
=======
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
>>>>>>> origin/codex/implement-crud-functions-for-new-backend-routes
      ),
      {
        method: 'POST',
        body: JSON.stringify(data),
<<<<<<< HEAD
      },
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
    const resp = await request<{ message: string }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/forbidden-actions/${actionId}`
      ),
=======
      }
    );
    return response.data;
  },

  /** Remove a forbidden action by ID */
  async delete(actionId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/forbidden-actions/${actionId}`),
>>>>>>> origin/codex/implement-crud-functions-for-new-backend-routes
      { method: 'DELETE' }
    );
    return resp;
  },
};
