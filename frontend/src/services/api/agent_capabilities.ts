import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentCapability,
  AgentCapabilityCreateData,
  AgentCapabilityUpdateData,
<<<<<<< HEAD
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
=======
} from '@/types/agents';

// Fetch capabilities for a given agent role
export const getAgentCapabilities = async (
  agentRoleId: string
): Promise<AgentCapability[]> => {
  return request<AgentCapability[]>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.RULES,
      `/roles/${agentRoleId}/capabilities`
    )
  );
};

// Create a new capability for an agent role
export const createAgentCapability = async (
  agentRoleId: string,
  data: AgentCapabilityCreateData
): Promise<AgentCapability> => {
  return request<AgentCapability>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.RULES,
      `/roles/${agentRoleId}/capabilities`
    ),
    { method: 'POST', body: JSON.stringify(data) }
  );
};

// Update an existing capability
export const updateAgentCapability = async (
  capabilityId: string,
  data: AgentCapabilityUpdateData
): Promise<AgentCapability> => {
  return request<AgentCapability>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.RULES,
      `/roles/capabilities/${capabilityId}`
    ),
    { method: 'PUT', body: JSON.stringify(data) }
  );
};

// Delete a capability
export const deleteAgentCapability = async (
  capabilityId: string
): Promise<{ message: string }> => {
  return request<{ message: string }>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.RULES,
      `/roles/capabilities/${capabilityId}`
    ),
    { method: 'DELETE' }
  );
>>>>>>> origin/codex/add-agent-capabilities-crud-functions
};
