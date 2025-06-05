import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type { ErrorProtocol, ErrorProtocolCreateData, ErrorProtocolUpdateData } from '@/types/error_protocol';

export const errorProtocolsApi = {
  async list(agentRoleId: string): Promise<ErrorProtocol[]> {
    return request<ErrorProtocol[]>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${agentRoleId}/error-protocols`)
    );
  },

  async create(agentRoleId: string, data: Omit<ErrorProtocolCreateData, 'agent_role_id'>): Promise<ErrorProtocol> {
    const response = await request<ErrorProtocol>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${agentRoleId}/error-protocols`),
      { method: 'POST', body: JSON.stringify({ ...data, agent_role_id: agentRoleId }) }
    );
    return response;
  },

  async update(protocolId: string, data: ErrorProtocolUpdateData): Promise<ErrorProtocol> {
    return request<ErrorProtocol>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/error-protocols/${protocolId}`),
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  async remove(protocolId: string): Promise<void> {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/error-protocols/${protocolId}`),
      { method: 'DELETE' }
    );
  },
};
