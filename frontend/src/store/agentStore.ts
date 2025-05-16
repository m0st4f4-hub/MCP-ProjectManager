import { Agent, AgentCreateData, AgentUpdateData, AgentFilters, AgentSortOptions } from '@/types/agent';
import { createBaseStore, BaseState, withLoading } from './baseStore';
import * as api from '@/services/api';

interface AgentState extends BaseState {
    agents: Agent[];
    editingAgent: Agent | null;
    isEditModalOpen: boolean;
    sortOptions: AgentSortOptions;
    filters: AgentFilters;
    
    // Actions
    fetchAgents: (filters?: AgentFilters) => Promise<void>;
    addAgent: (agentData: AgentCreateData) => Promise<void>;
    removeAgent: (id: number) => Promise<void>;
    editAgent: (id: number, agentData: AgentUpdateData) => Promise<void>;
    openEditModal: (agent: Agent) => void;
    closeEditModal: () => void;
    setSortOptions: (options: AgentSortOptions) => void;
    setFilters: (filters: AgentFilters) => void;
}

const initialState: Omit<AgentState, keyof BaseState> = {
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
    
    // These will be implemented in the store
    fetchAgents: async () => {},
    addAgent: async () => {},
    removeAgent: async () => {},
    editAgent: async () => {},
    openEditModal: () => {},
    closeEditModal: () => {},
    setSortOptions: () => {},
    setFilters: () => {}
};

export const useAgentStore = createBaseStore<AgentState>(
    initialState,
    { name: 'agent-store', persist: true }
);

// Initialize the store with actions
useAgentStore.setState((state) => ({
    ...state,
    
    fetchAgents: async (filters?: AgentFilters) => {
        return withLoading(useAgentStore.setState, async () => {
            const fetchedAgents = await api.getAgents();
            const sortedAgents = sortAgents(fetchedAgents, state.sortOptions);
            useAgentStore.setState({ agents: sortedAgents });
        });
    },

    addAgent: async (agentData: AgentCreateData) => {
        return withLoading(useAgentStore.setState, async () => {
            const newAgent = await api.createAgent(agentData);
            useAgentStore.setState((state) => ({
                agents: sortAgents([newAgent, ...state.agents], state.sortOptions)
            }));
        });
    },

    removeAgent: async (id: number) => {
        return withLoading(useAgentStore.setState, async () => {
            await api.deleteAgent(id);
            useAgentStore.setState((state) => ({
                agents: state.agents.filter(agent => agent.id !== id)
            }));
        });
    },

    editAgent: async (id: number, agentData: AgentUpdateData) => {
        return withLoading(useAgentStore.setState, async () => {
            const updated = await api.updateAgent(id, agentData);
            useAgentStore.setState((state) => ({
                agents: sortAgents(
                    state.agents.map(agent => agent.id === id ? updated : agent),
                    state.sortOptions
                ),
                editingAgent: null,
                isEditModalOpen: false
            }));
        });
    },

    openEditModal: (agent: Agent) => {
        useAgentStore.setState({ editingAgent: agent, isEditModalOpen: true });
    },

    closeEditModal: () => {
        useAgentStore.setState({ editingAgent: null, isEditModalOpen: false });
    },

    setSortOptions: (options: AgentSortOptions) => {
        useAgentStore.setState((state) => ({
            sortOptions: options,
            agents: sortAgents(state.agents, options)
        }));
    },

    setFilters: (filters: AgentFilters) => {
        useAgentStore.setState({ filters });
        state.fetchAgents(filters);
    }
}));

// Helper function to sort agents
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