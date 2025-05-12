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
};

const agentActionsCreator = (
    set: StoreApi<AgentState>['setState'], 
    get: StoreApi<AgentState>['getState']
): AgentActions => ({
    fetchAgents: async (filters?: AgentFilters) => {
        return withLoading(set, async () => {
            const effectiveFilters = filters || get().filters;
            const fetchedAgents = await api.getAgents(effectiveFilters);
            const sortedAgents = sortAgents(fetchedAgents, get().sortOptions);
            set({ agents: sortedAgents } as Partial<AgentState>);
        });
    },
    addAgent: async (agentData: AgentCreateData) => {
        return withLoading(set, async () => {
            const newAgent = await api.createAgent(agentData);
            set((state) => ({
                agents: sortAgents([newAgent, ...state.agents], state.sortOptions)
            } as Partial<AgentState>));
        });
    },
    removeAgent: async (id: string) => {
        return withLoading(set, async () => {
            await api.deleteAgent(id);
            set((state) => ({
                agents: state.agents.filter(agent => agent.id !== id)
            } as Partial<AgentState>));
        });
    },
    editAgent: async (id: string, agentData: AgentUpdateData) => {
        return withLoading(set, async () => {
            const updated = await api.updateAgent(id, agentData);
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
