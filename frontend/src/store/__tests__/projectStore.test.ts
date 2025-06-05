import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { useProjectStore } from '../projectStore'
import { useTaskStore } from '../taskStore'
import * as api from '@/services/api'

vi.mock('@/services/api', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  deleteProject: vi.fn(),
}))

const mockedApi = vi.mocked(api as any)

const initialState = {
  projects: [],
  loading: false,
  error: null,
  pollingIntervalId: null,
  isPolling: false,
  pollingError: null,
  filters: { is_archived: false, search: undefined, status: 'all', agentId: undefined },
}

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState(initialState as any)
    useTaskStore.setState({ removeTasksByProjectId: vi.fn() } as any)
    vi.clearAllMocks()
  })

  it('fetchProjects loads projects from API', async () => {
    const projects = [{ id: 'p1', name: 'Project 1', created_at: '2024-01-01' }]
    mockedApi.getProjects.mockResolvedValueOnce(projects)

    await act(async () => {
      await useProjectStore.getState().fetchProjects()
    })

    expect(mockedApi.getProjects).toHaveBeenCalled()
    expect(useProjectStore.getState().projects).toEqual(projects)
  })

  it('removeProject calls API and updates state', async () => {
    const removeTasksMock = vi.fn()
    useTaskStore.setState({ removeTasksByProjectId: removeTasksMock } as any)
    useProjectStore.setState({ ...initialState, projects: [{ id: 'p1', name: 'Project 1', created_at: '2024-01-01' }] } as any)
    mockedApi.deleteProject.mockResolvedValueOnce({} as any)

    await act(async () => {
      await useProjectStore.getState().removeProject('p1')
    })

    expect(mockedApi.deleteProject).toHaveBeenCalledWith('p1')
    expect(removeTasksMock).toHaveBeenCalledWith('p1')
    expect(useProjectStore.getState().projects).toEqual([])
  })
})
