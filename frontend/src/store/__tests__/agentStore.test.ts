import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useAgentStore } from '../agentStore';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  getAgents: vi.fn(),
  createAgent: vi.fn(),
  deleteAgentById: vi.fn(),
  updateAgentById: vi.fn(),
}));

const mockedApi = vi.mocked(api as any);

const initialState = {
  agents: [],
  editingAgent: null,
  isEditModalOpen: false,
  sortOptions: { field: 'created_at', direction: 'desc' },
  filters: { status: 'all', is_archived: false },
  loading: false,
  error: null,
};

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.setState({
      ...initialState,
      clearError: useAgentStore.getState().clearError,
    } as any);
    vi.clearAllMocks();
  });

  it('fetchAgents updates state from API', async () => {
    const agents = [{ id: '1', name: 'Alpha', created_at: '2024-01-01' }];
    mockedApi.getAgents.mockResolvedValueOnce(agents);

    await act(async () => {
      await useAgentStore.getState().fetchAgents(0, 10);
    });

    expect(mockedApi.getAgents).toHaveBeenCalledWith(
      0,
      10,
      undefined,
      'all',
      false
    );
    expect(useAgentStore.getState().agents).toEqual(agents);
    expect(useAgentStore.getState().loading).toBe(false);
  });

  it('addAgent calls API and prepends agent', async () => {
    const newAgent = { id: '2', name: 'Beta', created_at: '2024-01-02' };
    mockedApi.createAgent.mockResolvedValueOnce(newAgent);

    await act(async () => {
      await useAgentStore.getState().addAgent({ name: 'Beta' } as any);
    });

    expect(mockedApi.createAgent).toHaveBeenCalledWith({ name: 'Beta' });
    expect(useAgentStore.getState().agents[0]).toEqual(newAgent);
  });

  it('removeAgent deletes agent and calls API', async () => {
    useAgentStore.setState({
      ...initialState,
      agents: [{ id: '1', name: 'Alpha', created_at: '2024-01-01' }],
    } as any);
    mockedApi.deleteAgentById.mockResolvedValueOnce({} as any);

    await act(async () => {
      await useAgentStore.getState().removeAgent('1');
    });

    expect(mockedApi.deleteAgentById).toHaveBeenCalledWith('1');
    expect(useAgentStore.getState().agents).toEqual([]);
  });

  it('openEditModal and closeEditModal update modal state', () => {
    const agent = { id: '1', name: 'Alpha', created_at: '2024' };
    act(() => {
      useAgentStore.getState().openEditModal(agent as any);
    });
    expect(useAgentStore.getState().editingAgent).toEqual(agent);
    expect(useAgentStore.getState().isEditModalOpen).toBe(true);

    act(() => {
      useAgentStore.getState().closeEditModal();
    });
    expect(useAgentStore.getState().editingAgent).toBeNull();
    expect(useAgentStore.getState().isEditModalOpen).toBe(false);
  });

  it('setSortOptions sorts agents by name', () => {
    useAgentStore.setState({
      ...initialState,
      agents: [
        { id: '2', name: 'Beta', created_at: '2024' },
        { id: '1', name: 'Alpha', created_at: '2024' },
      ],
    } as any);

    act(() => {
      useAgentStore
        .getState()
        .setSortOptions({ field: 'name', direction: 'asc' });
    });

    expect(useAgentStore.getState().agents[0].name).toBe('Alpha');
  });

  it('setFilters updates filters and refetches', async () => {
    mockedApi.getAgents.mockResolvedValueOnce([]);

    await act(async () => {
      await useAgentStore
        .getState()
        .setFilters({ status: 'active', is_archived: false });
    });

    expect(mockedApi.getAgents).toHaveBeenCalled();
    expect(useAgentStore.getState().filters.status).toBe('active');
  });

  it('editAgent updates agent via API', async () => {
    useAgentStore.setState({
      ...initialState,
      agents: [{ id: '1', name: 'Alpha', created_at: '2024' }],
    } as any);
    const updated = { id: '1', name: 'Gamma', created_at: '2024' };
    mockedApi.updateAgentById.mockResolvedValueOnce(updated);

    await act(async () => {
      await useAgentStore.getState().editAgent('1', { name: 'Gamma' } as any);
    });

    expect(mockedApi.updateAgentById).toHaveBeenCalledWith('1', {
      name: 'Gamma',
    });
    expect(useAgentStore.getState().agents[0].name).toBe('Gamma');
    expect(useAgentStore.getState().isEditModalOpen).toBe(false);
  });
});
