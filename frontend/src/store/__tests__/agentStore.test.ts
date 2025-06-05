import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { useAgentStore } from '../agentStore'
import * as api from '@/services/api'

vi.mock('@/services/api', () => ({
  getAgents: vi.fn(),
  createAgent: vi.fn(),
  deleteAgentById: vi.fn(),
  updateAgentById: vi.fn()
}))

const mockedApi = vi.mocked(api as any)

const initialState = {
  agents: [],
  editingAgent: null,
  isEditModalOpen: false,
  sortOptions: { field: 'created_at', direction: 'desc' },
  filters: { status: 'all', is_archived: false },
  loading: false,
  error: null,
}

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.setState({ ...initialState, clearError: useAgentStore.getState().clearError } as any)
    vi.clearAllMocks()
  })

  it('fetchAgents updates state from API', async () => {
    const agents = [{ id: '1', name: 'Alpha', created_at: '2024-01-01' }]
    mockedApi.getAgents.mockResolvedValueOnce(agents)

    await act(async () => {
      await useAgentStore.getState().fetchAgents(0, 10)
    })

    expect(mockedApi.getAgents).toHaveBeenCalledWith(0, 10, undefined, 'all', false)
    expect(useAgentStore.getState().agents).toEqual(agents)
    expect(useAgentStore.getState().loading).toBe(false)
  })

  it('addAgent calls API and prepends agent', async () => {
    const newAgent = { id: '2', name: 'Beta', created_at: '2024-01-02' }
    mockedApi.createAgent.mockResolvedValueOnce(newAgent)

    await act(async () => {
      await useAgentStore.getState().addAgent({ name: 'Beta' } as any)
    })

    expect(mockedApi.createAgent).toHaveBeenCalledWith({ name: 'Beta' })
    expect(useAgentStore.getState().agents[0]).toEqual(newAgent)
  })
})
