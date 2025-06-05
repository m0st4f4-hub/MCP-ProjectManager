import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentCapability,
  AgentCapabilityCreateData,
  AgentCapabilityUpdateData,
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
};
