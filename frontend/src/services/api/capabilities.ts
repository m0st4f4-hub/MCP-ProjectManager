import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';

export interface Capability {
  id: string;
  agent_role_id: string;
  capability: string;
  description?: string | null;
  is_active?: boolean;
}

export const capabilityApi = {
  list: async (agentRoleId: string): Promise<Capability[]> => {
    const role = await request<{ capabilities: Capability[] }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${agentRoleId}`)
    );
    return role.capabilities || [];
  },

  add: async (
    agentRoleId: string,
    capability: string,
    description?: string
  ): Promise<Capability> => {
    return request<Capability>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${agentRoleId}/capabilities`),
      {
        method: 'POST',
        body: JSON.stringify({ capability, description }),
      }
    );
  },

  remove: async (capabilityId: string): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/capabilities/${capabilityId}`),
      { method: 'DELETE' }
    );
  },
};
