import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  AgentRole,
  AgentRoleCreateData,
  AgentRoleUpdateData,
  AgentRoleListResponse,
  AgentRoleResponse,
} from '@/types/agent_role';

export const agentRolesApi = {
  async list(activeOnly = true): Promise<AgentRole[]> {
    const params = new URLSearchParams();
    params.append('active_only', String(activeOnly));
    const res = await request<AgentRole[]>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/?${params.toString()}`)
    );
    return res;
  },

  async get(name: string): Promise<AgentRole> {
    const res = await request<AgentRole>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${name}`)
    );
    return res;
  },

  async create(data: AgentRoleCreateData): Promise<AgentRole> {
    const res = await request<AgentRoleResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/'),
      { method: 'POST', body: JSON.stringify(data) }
    );
    return res.data;
  },

  async update(id: string, data: AgentRoleUpdateData): Promise<AgentRole> {
    const res = await request<AgentRoleResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${id}`),
      { method: 'PUT', body: JSON.stringify(data) }
    );
    return res.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/roles/${id}`),
      { method: 'DELETE' }
    );
  },
};
