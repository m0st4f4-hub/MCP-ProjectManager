import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type { AgentCapability } from "@/types/agent";

export const agentRolesApi = {
  getCapabilities: async (roleName: string): Promise<AgentCapability[]> => {
    const role = await request<any>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/${roleName}`)
    );
    return role.capabilities || [];
  },

  addCapability: async (
    roleId: string,
    capability: string,
    description?: string
  ): Promise<AgentCapability> => {
    return request(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/${roleId}/capabilities`),
      {
        method: "POST",
        body: JSON.stringify({ capability, description }),
      }
    );
  },

  deleteCapability: async (capabilityId: string): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/capabilities/${capabilityId}`),
      { method: "DELETE" }
    );
  },
};

