import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
<<<<<<< HEAD
import type { ErrorProtocol, ErrorProtocolCreateData } from '@/types/agents';

/**
 * MCP wrappers for error protocol management
 */
export const errorProtocolsApi = {
  /** Create a new error protocol via MCP */
  async create(data: ErrorProtocolCreateData): Promise<ErrorProtocol> {
    const { agent_role_id, ...payload } = data;
    const params = new URLSearchParams({ role_id: agent_role_id });
    const response = await request<{ success: boolean; protocol: ErrorProtocol }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.MCP_TOOLS,
        `/error-protocol/add?${params.toString()}`
      ),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.protocol;
  },

  /** List error protocols for an optional agent role */
  async list(agentRoleId?: string): Promise<ErrorProtocol[]> {
    const query = agentRoleId
      ? `?role_id=${encodeURIComponent(agentRoleId)}`
      : '';
    const response = await request<{
      success: boolean;
      protocols: ErrorProtocol[];
    }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.MCP_TOOLS,
        `/error-protocol/list${query}`
      )
    );
    return response.protocols;
  },

  /** Delete an error protocol by ID */
  async remove(protocolId: string): Promise<void> {
    const params = new URLSearchParams({ protocol_id: protocolId });
    await request<{ success: boolean }>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.MCP_TOOLS,
        `/error-protocol/remove?${params.toString()}`
=======
import type {
  ErrorProtocol,
  ErrorProtocolCreateData,
  ErrorProtocolUpdateData,
  ErrorProtocolFilters,
  RuleResponse,
  RuleListResponse,
} from '@/types';

export const errorProtocolsApi = {
  async list(
    filters?: ErrorProtocolFilters & { skip?: number; limit?: number }
  ): Promise<RuleListResponse<ErrorProtocol>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return request<RuleListResponse<ErrorProtocol>>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/violations/error-protocols?${params.toString()}`
      )
    );
  },

  async create(data: ErrorProtocolCreateData): Promise<ErrorProtocol> {
    const response = await request<RuleResponse<ErrorProtocol>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/violations/error-protocols'),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async update(
    protocolId: string,
    data: ErrorProtocolUpdateData
  ): Promise<ErrorProtocol> {
    const response = await request<RuleResponse<ErrorProtocol>>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/violations/error-protocols/${protocolId}`
      ),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async delete(protocolId: string): Promise<void> {
    await request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/violations/error-protocols/${protocolId}`
>>>>>>> origin/16bcjg-codex/implement-crud-for-error-protocols
      ),
      { method: 'DELETE' }
    );
  },
};
