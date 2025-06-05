import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type { Capability, CapabilityCreateData } from '@/types/capability';

export const capabilitiesApi = {
  async list(agentRoleName: string): Promise<Capability[]> {
    const res = await request<any>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${agentRoleName}`)
    );
    return (res as any).capabilities ?? (res as Capability[]);
  },

  async create(
    agentRoleId: string,
    data: CapabilityCreateData
  ): Promise<Capability> {
    const res = await request<any>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${agentRoleId}/capabilities`
      ),
      { method: 'POST', body: JSON.stringify(data) }
    );
    return (res as any).data ?? (res as Capability);
  },

  async delete(capabilityId: string): Promise<void> {
    await request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/capabilities/${capabilityId}`
      ),
      { method: 'DELETE' }
    );
  },
};
