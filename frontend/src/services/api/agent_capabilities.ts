import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentCapability,
  AgentCapabilityCreateData,
  AgentCapabilityUpdateData,
  AgentCapabilityListResponse,
  AgentCapabilityResponse,
} from '@/types/agents';

/**
 * CRUD wrapper for agent capability endpoints.
 */
export const agentCapabilitiesApi = {
  /** List capabilities, optionally filtered by agent role */
  async list(agentRoleId?: string): Promise<AgentCapability[]> {
    const params = new URLSearchParams();
    if (agentRoleId) params.append('agent_role_id', agentRoleId);
    const res = await request<AgentCapabilityListResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/capabilities?${params}`)
    );
    return res.data;
  },

  /** Retrieve a single capability by ID */
  async get(capabilityId: string): Promise<AgentCapability> {
    const res = await request<AgentCapabilityResponse>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      )
    );
    return res.data;
  },

  /** Create a new capability for a role */
  async create(
    roleId: string,
    data: AgentCapabilityCreateData
  ): Promise<AgentCapability> {
    const res = await request<AgentCapabilityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${roleId}/capabilities`),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /** Update an existing capability */
  async update(
    capabilityId: string,
    data: AgentCapabilityUpdateData
  ): Promise<AgentCapability> {
    const res = await request<AgentCapabilityResponse>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      ),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /** Delete a capability */
  async delete(capabilityId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      ),
      { method: 'DELETE' }
    );
  },
};

// Legacy function exports for backwards compatibility
export const getAgentCapabilities = (agentRoleId: string) => 
  agentCapabilitiesApi.list(agentRoleId);

export const createAgentCapability = (
  agentRoleId: string,
  data: AgentCapabilityCreateData
) => agentCapabilitiesApi.create(agentRoleId, data);

export const updateAgentCapability = (
  capabilityId: string,
  data: AgentCapabilityUpdateData
) => agentCapabilitiesApi.update(capabilityId, data);

export const deleteAgentCapability = (capabilityId: string) =>
  agentCapabilitiesApi.delete(capabilityId);
