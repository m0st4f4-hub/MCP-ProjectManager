import { StoreApi } from 'zustand';
import { Agent, AgentCreateData, AgentUpdateData, AgentFilters, AgentSortOptions } from '@/types/agent';
import { createBaseStore, BaseState, withLoading } from './baseStore';
import * as api from '@/services/api';

type AgentActions = {
    fetchAgents: (filters?: AgentFilters) => Promise<void>;
    addAgent: (agentData: AgentCreateData) => Promise<void>;
    removeAgent: (id: string) => Promise<void>;
    editAgent: (id: string, agentData: AgentUpdateData) => Promise<void>;
    openEditModal: (agent: Agent) => void;
    closeEditModal: () => void;
    setSortOptions: (options: AgentSortOptions) => void;
    setFilters: (filters: AgentFilters) => void;
};

export interface AgentState extends BaseState, AgentActions {
    agents: Agent[];
    editingAgent: Agent | null;
    isEditModalOpen: boolean;
    sortOptions: AgentSortOptions;
    filters: AgentFilters;
    loading: boolean;
    error: string | null;
}

const initialAgentData: Omit<AgentState, keyof BaseState | keyof AgentActions> = {
    agents: [],
    editingAgent: null,
    isEditModalOpen: false,
    sortOptions: {
        field: 'created_at',
        direction: 'desc'
    },
    filters: {
        status: 'all'
    },
    loading: false,
    error: null,
};

const agentActionsCreator = (
    set: StoreApi<AgentState>['setState'], 
    get: StoreApi<AgentState>['getState']
): AgentActions => ({
    fetchAgents: async (filters?: AgentFilters) => {
        set({ loading: true, error: null });
        try {
            const effectiveFilters = filters || get().filters;
            const fetchedAgents = await api.getAgents(effectiveFilters);
            const sortedAgents = sortAgents(fetchedAgents, get().sortOptions);
            set({ agents: sortedAgents, loading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
            set({ error: errorMessage, loading: false });
            console.error('Error fetching agents:', err);
        }
    },
    addAgent: async (agentData: AgentCreateData) => {
        const currentAgents = get().agents;
        set({ loading: true, error: null });
        try {
            console.log(`[Store] Calling API to create agent: ${agentData.name}`);
            const newAgent = await api.createAgent(agentData);
            console.log(`[Store] API returned new agent:`, newAgent);
            set((state) => ({
                agents: sortAgents([newAgent, ...state.agents], state.sortOptions),
                loading: false
            } as Partial<AgentState>));
            console.log(`[Store] Agent added to state.`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add agent';
            set({ error: errorMessage, loading: false });
            console.error('[Store] Error adding agent:', err);
            throw err;
        }
    },
    removeAgent: async (id: string) => {
        set({ loading: true });
        try {
            await api.deleteAgentById(id);
            set(state => ({
                agents: state.agents.filter(agent => agent.id !== id),
                loading: false
            }));
            console.log(`[Store] Agent ${id} removed locally (API call skipped).`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove agent';
            set({ error: errorMessage });
            console.error(`[Store] Error removing agent ${id}:`, err);
            throw err;
        }
    },
    editAgent: async (id: string, agentData: AgentUpdateData) => {
        return withLoading(set, async () => {
            const updated = await api.updateAgentById(id, agentData);
            set((state) => ({
                agents: sortAgents(
                    state.agents.map(agent => agent.id === id ? updated : agent),
                    state.sortOptions
                ),
                editingAgent: null,
                isEditModalOpen: false
            } as Partial<AgentState>));
        });
    },
    openEditModal: (agent: Agent) => {
        set({ editingAgent: agent, isEditModalOpen: true } as Partial<AgentState>);
    },
    closeEditModal: () => {
        set({ editingAgent: null, isEditModalOpen: false } as Partial<AgentState>);
    },
    setSortOptions: (options: AgentSortOptions) => {
        set((state) => ({
            sortOptions: options,
            agents: sortAgents(state.agents, options)
        } as Partial<AgentState>));
    },
    setFilters: (filters: AgentFilters) => {
        set({ filters } as Partial<AgentState>);
        get().fetchAgents(filters);
    }
});

export const useAgentStore = createBaseStore<AgentState, AgentActions>(
    initialAgentData,
    agentActionsCreator,
    { name: 'agent-store', persist: true }
);

const sortAgents = (agents: Agent[], options: AgentSortOptions): Agent[] => {
    return [...agents].sort((a, b) => {
        if (options.field === 'created_at') {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return options.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (options.field === 'name') {
            return options.direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        return 0;
    });
};
