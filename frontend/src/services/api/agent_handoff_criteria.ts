import {
  AgentHandoffCriteria,
  AgentHandoffCriteriaCreateData,
} from '@/types/agents';
import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';

// Create new handoff criteria
export const createAgentHandoffCriteria = async (
  data: AgentHandoffCriteriaCreateData
): Promise<AgentHandoffCriteria> => {
  const response = await request<{
    success: boolean;
    criteria: AgentHandoffCriteria;
  }>(buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/handoff/create'), {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.criteria;
};

// List handoff criteria optionally filtered by agent role
export const listAgentHandoffCriteria = async (
  agentRoleId?: string
): Promise<AgentHandoffCriteria[]> => {
  const query = agentRoleId
    ? `?agent_role_id=${encodeURIComponent(agentRoleId)}`
    : '';
  const response = await request<{
    success: boolean;
    criteria: AgentHandoffCriteria[];
  }>(buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, `/handoff/list${query}`));
  return response.criteria;
};

// Delete handoff criteria by ID
export const deleteAgentHandoffCriteria = async (
  criteriaId: string
): Promise<void> => {
  await request<{ success: boolean }>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.MCP_TOOLS,
      `/handoff/delete?criteria_id=${encodeURIComponent(criteriaId)}`
    ),
    { method: 'DELETE' }
  );
};
