import {
  Agent,
  AgentUpdateData as AgentUpdateDataType,
  AgentFilters,
  AgentCreateData,
  AgentRule,
  AgentArchiveResponse,
  AgentUnarchiveResponse,
  AgentRuleAddResponse,
  AgentRuleRemoveResponse,
  Criteria,
  CriteriaCreateData,
  CriteriaUpdateData,
} from '@/types';
import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';

// Intermediate raw type for agents from backend
interface RawAgent {
  id: string | number;
  name: string;
  created_at?: string | null;
  // Add new fields for agent statistics from backend
  task_count?: number;
  completed_task_count?: number;
  project_names?: string[];
  [key: string]: unknown;
}

// Fetch all agents
export const getAgents = async (
  skip: number = 0,
  limit: number = 100,
  search?: string,
  status?: string,
  is_archived?: boolean
): Promise<Agent[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('skip', String(skip));
  queryParams.append('limit', String(limit));
  if (search !== undefined) queryParams.append('search', search);
  if (status !== undefined) queryParams.append('status', status);
  if (is_archived !== undefined)
    queryParams.append('is_archived', String(is_archived));
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `?${queryString}`);
  const rawAgents = await request<RawAgent[]>(url);
  return rawAgents.map((rawAgent) => ({
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ''),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
    is_archived: (rawAgent as any).is_archived ?? false,
    // Include new fields in the mapping
    task_count: rawAgent.task_count ?? 0,
    completed_task_count: rawAgent.completed_task_count ?? 0,
    project_names: rawAgent.project_names ?? [],
  }));
};

export const getAgentById = async (agent_id: string): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/id/${agent_id}`)
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ''),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
    is_archived: (rawAgent as any).is_archived ?? false,
  };
};

export const getAgentByName = async (agent_name: string): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agent_name}`)
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ''),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
    is_archived: (rawAgent as any).is_archived ?? false,
  };
};

export const createAgent = async (
  agentData: AgentCreateData
): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, '/'),
    { method: 'POST', body: JSON.stringify(agentData) }
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ''),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
    is_archived: (rawAgent as any).is_archived ?? false,
  };
};

export const updateAgentById = async (
  agent_id: string,
  agentData: AgentUpdateDataType
): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agent_id}`),
    { method: 'PUT', body: JSON.stringify(agentData) }
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ''),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
    is_archived: (rawAgent as any).is_archived ?? false,
  };
};

export const deleteAgentById = async (agent_id: string): Promise<null> => {
  await request<null>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agent_id}`),
    { method: 'DELETE' }
  );
  return null;
};

export const archiveAgent = async (
  agentId: string
): Promise<AgentArchiveResponse> => {
  return request<AgentArchiveResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agentId}/archive`),
    { method: 'POST' }
  );
};

export const unarchiveAgent = async (
  agentId: string
): Promise<AgentUnarchiveResponse> => {
  return request<AgentUnarchiveResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agentId}/unarchive`),
    { method: 'POST' }
  );
};

export const addRuleToAgent = async (
  agentId: string,
  ruleId: string
): Promise<AgentRuleAddResponse> => {
  return request<AgentRuleAddResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agentId}/rules/`),
    { method: 'POST', body: JSON.stringify({ rule_id: ruleId }) }
  );
};

export const removeRuleFromAgent = async (
  agentId: string,
  ruleId: string
): Promise<AgentRuleRemoveResponse> => {
  return request<AgentRuleRemoveResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agentId}/rules/${ruleId}`),
    { method: 'DELETE' }
  );
};

export const getAgentRules = async (agentId: string): Promise<AgentRule[]> => {
  return request<AgentRule[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/${agentId}/rules/`)
  );
};

// ----- Agent Handoff Criteria API -----
interface RawCriteria {
  id: string | number;
  agent_role_id: string | number;
  criteria: string;
  description?: string | null;
  target_agent_role?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  [key: string]: unknown;
}

const mapCriteria = (raw: RawCriteria): Criteria => ({
  ...raw,
  id: String(raw.id),
  agent_role_id: String(raw.agent_role_id),
  criteria: String(raw.criteria),
  description: raw.description ? String(raw.description) : null,
  target_agent_role: raw.target_agent_role
    ? String(raw.target_agent_role)
    : null,
  is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
  created_at: String(raw.created_at || new Date().toISOString()),
});

export const createCriteria = async (
  roleId: string,
  data: CriteriaCreateData
): Promise<Criteria> => {
  const raw = await request<RawCriteria>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.AGENTS,
      `/roles/${roleId}/handoff-criteria`
    ),
    { method: 'POST', body: JSON.stringify(data) }
  );
  return mapCriteria(raw);
};

export const listCriteria = async (roleId: string): Promise<Criteria[]> => {
  const raw = await request<RawCriteria[]>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.AGENTS,
      `/roles/${roleId}/handoff-criteria`
    )
  );
  return raw.map(mapCriteria);
};

export const updateCriteria = async (
  criteriaId: string,
  data: CriteriaUpdateData
): Promise<Criteria> => {
  const raw = await request<RawCriteria>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/handoff-criteria/${criteriaId}`),
    { method: 'PUT', body: JSON.stringify(data) }
  );
  return mapCriteria(raw);
};

export const deleteCriteria = async (criteriaId: string): Promise<void> => {
  await request<void>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS, `/handoff-criteria/${criteriaId}`),
    { method: 'DELETE' }
  );
};
