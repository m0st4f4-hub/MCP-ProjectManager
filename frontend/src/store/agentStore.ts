import { StoreApi } from "zustand";
import {
  Agent,
  AgentCreateData,
  AgentUpdateData,
  AgentFilters,
  AgentSortOptions,
} from "@/types/agent";
import { createBaseStore, BaseState, withLoading } from "./baseStore";
import * as api from "@/services/api";
import { handleApiError } from "@/lib/apiErrorHandler";

type AgentActions = {
  fetchAgents: (skip: number, limit: number, filters?: AgentFilters) => Promise<void>;
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

const initialAgentData: Omit<AgentState, keyof BaseState | keyof AgentActions> =
  {
    agents: [],
    editingAgent: null,
    isEditModalOpen: false,
    sortOptions: {
      field: "created_at",
      direction: "desc",
    },
    filters: {
      status: "all",
      is_archived: false,
    },
  };

// Utility: Shallow equality for objects
function shallowEqual<T extends object>(a: T, b: T): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key as keyof T] !== b[key as keyof T]) return false;
  }
  return true;
}

// Improved upsertAgents: preserve references for unchanged items
const upsertAgents = (
  fetchedAgents: Agent[],
  existingAgents: Agent[],
): Agent[] => {
  const agentMap = new Map(existingAgents.map((agent) => [agent.id, agent]));
  const result: Agent[] = [];
  for (const newAgent of fetchedAgents) {
    const oldAgent = agentMap.get(newAgent.id);
    if (oldAgent && shallowEqual(oldAgent, newAgent)) {
      result.push(oldAgent); // preserve reference
    } else {
      result.push(newAgent);
    }
  }
  return result;
};

// Utility: Compare arrays of agents by id and shallow equality
const areAgentsEqual = (a: Agent[], b: Agent[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || !shallowEqual(a[i], b[i])) return false;
  }
  return true;
};

const agentActionsCreator = (
  set: StoreApi<AgentState>["setState"],
  get: StoreApi<AgentState>["getState"],
): AgentActions => ({
  fetchAgents: async (skip: number = 0, limit: number = 100, filters?: AgentFilters) => {
    set({ loading: true, error: null });
    try {
      const effectiveFilters = filters || get().filters;
      console.log("[AgentStore] Fetching agents with effective filters:", effectiveFilters);
      const fetchedAgents = await api.getAgents(
        skip,
        limit,
        effectiveFilters.search,
        effectiveFilters.status,
        effectiveFilters.is_archived ?? undefined
      );
      set((state) => {
        const updatedAgents = upsertAgents(fetchedAgents, state.agents);
        if (areAgentsEqual(updatedAgents, state.agents)) {
          return { loading: false };
        }
        return {
          agents: sortAgents(updatedAgents, state.sortOptions),
          loading: false,
        };
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch agents";
      set({ error: errorMessage, loading: false });
      handleApiError(err, "Failed to fetch agents");
      console.error("Error fetching agents:", err);
    }
  },
  addAgent: async (agentData: AgentCreateData) => {
    set({ loading: true, error: null });
    try {
      console.log(`[Store] Calling API to create agent: ${agentData.name}`);
      const newAgent = await api.createAgent(agentData);
      console.log(`[Store] API returned new agent:`, newAgent);
      set(
        (state) =>
          ({
            agents: sortAgents([newAgent, ...state.agents], state.sortOptions),
            loading: false,
          }) as Partial<AgentState>,
      );
      console.log(`[Store] Agent added to state.`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add agent";
      set({ error: errorMessage, loading: false });
      handleApiError(err, "Failed to add agent");
      console.error("[Store] Error adding agent:", err);
      throw err;
    }
  },
  removeAgent: async (id: string) => {
    set({ loading: true });
    try {
      await api.deleteAgentById(id);
      set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== id),
        loading: false,
      }));
      console.log(`[Store] Agent ${id} removed locally (API call skipped).`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove agent";
      set({ error: errorMessage });
      handleApiError(err, "Failed to remove agent");
      console.error(`[Store] Error removing agent ${id}:`, err);
      throw err;
    }
  },
  editAgent: async (id: string, agentData: AgentUpdateData) => {
    return withLoading(set, async () => {
      const updated = await api.updateAgentById(id, agentData);
      set(
        (state) =>
          ({
            agents: sortAgents(
              state.agents.map((agent) => (agent.id === id ? updated : agent)),
              state.sortOptions,
            ),
            editingAgent: null,
            isEditModalOpen: false,
          }) as Partial<AgentState>,
      );
    });
  },
  openEditModal: (agent: Agent) => {
    set({ editingAgent: agent, isEditModalOpen: true } as Partial<AgentState>);
  },
  closeEditModal: () => {
    set({ editingAgent: null, isEditModalOpen: false } as Partial<AgentState>);
  },
  setSortOptions: (options: AgentSortOptions) => {
    set(
      (state) =>
        ({
          sortOptions: options,
          agents: sortAgents(state.agents, options),
        }) as Partial<AgentState>,
    );
  },
  setFilters: (filters: AgentFilters) => {
    set({ filters } as Partial<AgentState>);
    get().fetchAgents(0, 100, filters);
  },
});

export const useAgentStore = createBaseStore<AgentState, AgentActions>(
  initialAgentData,
  agentActionsCreator,
  { name: "agent-store", persist: true },
);

const sortAgents = (agents: Agent[], options: AgentSortOptions): Agent[] => {
  return [...agents].sort((a, b) => {
    if (options.field === "created_at") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return options.direction === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (options.field === "name") {
      return options.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });
};
