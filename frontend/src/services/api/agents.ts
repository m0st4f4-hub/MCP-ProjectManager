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
} from "@/types";
import { request } from "./request";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Fetch all agents
export const getAgents = async (skip: number = 0, limit: number = 100, search?: string, status?: string, is_archived?: boolean): Promise<Agent[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  if (search !== undefined) queryParams.append("search", search);
  if (status !== undefined) queryParams.append("status", status);
  if (is_archived !== undefined) queryParams.append("is_archived", String(is_archived));
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/agents/${queryString ? `?${queryString}` : ""}`;
  const rawAgents = await request<RawAgent[]>(url);
  return rawAgents.map((rawAgent) => ({
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ""),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
    // Include new fields in the mapping
    task_count: rawAgent.task_count ?? 0,
    completed_task_count: rawAgent.completed_task_count ?? 0,
    project_names: rawAgent.project_names ?? [],
  }));
};

export const getAgentById = async (agent_id: string): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    `${API_BASE_URL}/agents/${agent_id}`,
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ""),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
  };
};

export const getAgentByName = async (agent_name: string): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    `${API_BASE_URL}/agents/${agent_name}`,
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ""),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
  };
};

export const createAgent = async (agentData: AgentCreateData): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    `${API_BASE_URL}/agents/`,
    { method: "POST", body: JSON.stringify(agentData) },
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ""),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
  };
};

export const updateAgentById = async (
  agent_id: string,
  agentData: AgentUpdateDataType,
): Promise<Agent> => {
  const rawAgent = await request<RawAgent>(
    `${API_BASE_URL}/agents/${agent_id}`,
    { method: "PUT", body: JSON.stringify(agentData) },
  );
  return {
    ...rawAgent,
    id: String(rawAgent.id),
    name: String(rawAgent.name || ""),
    created_at: String(rawAgent.created_at || new Date().toISOString()),
  };
};

export const deleteAgentById = async (agent_id: string): Promise<null> => {
  await request<null>(
    `${API_BASE_URL}/agents/${agent_id}`,
    { method: "DELETE" },
  );
  return null;
};

export const archiveAgent = async (agentId: string): Promise<AgentArchiveResponse> => {
  return request<AgentArchiveResponse>(`${API_BASE_URL}/agents/${agentId}/archive`, { method: "POST" });
};

export const unarchiveAgent = async (agentId: string): Promise<AgentUnarchiveResponse> => {
  return request<AgentUnarchiveResponse>(`${API_BASE_URL}/agents/${agentId}/unarchive`, { method: "POST" });
};

export const addRuleToAgent = async (agentId: string, ruleId: string): Promise<AgentRuleAddResponse> => {
  return request<AgentRuleAddResponse>(`${API_BASE_URL}/agents/${agentId}/rules/`, { method: "POST", body: JSON.stringify({ rule_id: ruleId }) });
};

export const removeRuleFromAgent = async (agentId: string, ruleId: string): Promise<AgentRuleRemoveResponse> => {
  return request<AgentRuleRemoveResponse>(`${API_BASE_URL}/agents/${agentId}/rules/${ruleId}`, { method: "DELETE" });
};

export const getAgentRules = async (agentId: string): Promise<AgentRule[]> => {
  return request<AgentRule[]>(`${API_BASE_URL}/agents/${agentId}/rules/`);
};
