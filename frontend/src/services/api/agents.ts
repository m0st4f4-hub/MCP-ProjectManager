import { Agent, AgentUpdateData as AgentUpdateDataType, AgentFilters } from "@/types";
import { request } from "./request";

// Intermediate raw type for agents from backend
interface RawAgent {
    id: string | number;
    name: string;
    created_at?: string | null;
    [key: string]: unknown;
}

// Fetch all agents
export const getAgents = async (filters?: AgentFilters): Promise<Agent[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    const queryString = queryParams.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/agents/${queryString ? `?${queryString}` : ''}`;
    const rawAgents = await request<RawAgent[]>(url);
    return rawAgents.map(rawAgent => ({
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    }));
};

export const getAgentById = async (agent_id: string): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/agents/${agent_id}`);
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const getAgentByName = async (agent_name: string): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/agents/name/${agent_name}`);
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const createAgent = async (name: string): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/agents/`, { method: 'POST', body: JSON.stringify({ name }) });
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const updateAgentById = async (agent_id: string, agentData: AgentUpdateDataType): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/agents/${agent_id}`, { method: 'PUT', body: JSON.stringify(agentData) });
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const deleteAgentById = async (agent_id: string): Promise<null> => {
    await request<null>(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/agents/${agent_id}`, { method: 'DELETE' });
    return null;
}; 