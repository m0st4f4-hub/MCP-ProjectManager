import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type { AgentCapability } from '@/types';

/**
 * API wrapper for managing agent role capabilities.
 */
export const agentCapabilitiesApi = {
  /** Add a capability to an agent role */
  async create(
    roleId: string,
    data: AgentCapability
  ): Promise<AgentCapability> {
    return request<AgentCapability>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${roleId}/capabilities`),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /** List capabilities for an agent role */
  async list(roleId: string): Promise<AgentCapability[]> {
    return request<AgentCapability[]>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${roleId}/capabilities`)
    );
  },

  /** Get a specific capability by ID */
  async get(capabilityId: string): Promise<AgentCapability> {
    return request<AgentCapability>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      )
    );
  },

  /** Update an existing capability */
  async update(
    capabilityId: string,
    data: Partial<AgentCapability>
  ): Promise<AgentCapability> {
    return request<AgentCapability>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      ),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /** Delete a capability */
  async delete(capabilityId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      ),
      {
        method: 'DELETE',
      }
    );
  },
};
