import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useProjectStore } from '../projectStore';
import { useTaskStore } from '../taskStore';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  deleteProject: vi.fn(),
}));

const mockedApi = vi.mocked(api as any);

const initialState = {
  projects: [],
  loading: false,
  error: null,
  pollingIntervalId: null,
  isPolling: false,
  pollingError: null,
  filters: {
    is_archived: false,
    search: undefined,
    status: 'all',
    agentId: undefined,
  },
};

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState(initialState as any);
    useTaskStore.setState({ removeTasksByProjectId: vi.fn() } as any);
    vi.clearAllMocks();
  });

  it('fetchProjects loads projects from API', async () => {
    const projects = [
      { id: 'p1', name: 'Project 1', created_at: '2024-01-01' },
    ];
    mockedApi.getProjects.mockResolvedValueOnce(projects);

    await act(async () => {
      await useProjectStore.getState().fetchProjects();
    });

    expect(mockedApi.getProjects).toHaveBeenCalled();
    expect(useProjectStore.getState().projects).toEqual(projects);
  });

  it('removeProject calls API and updates state', async () => {
    const removeTasksMock = vi.fn();
    useTaskStore.setState({ removeTasksByProjectId: removeTasksMock } as any);
    useProjectStore.setState({
      ...initialState,
      projects: [{ id: 'p1', name: 'Project 1', created_at: '2024-01-01' }],
    } as any);
    mockedApi.deleteProject.mockResolvedValueOnce({} as any);

    await act(async () => {
      await useProjectStore.getState().removeProject('p1');
    });

    expect(mockedApi.deleteProject).toHaveBeenCalledWith('p1');
    expect(removeTasksMock).toHaveBeenCalledWith('p1');
    expect(useProjectStore.getState().projects).toEqual([]);
  });

  it('addProject creates project and refreshes list', async () => {
    const newProject = { id: 'p2', name: 'P2', created_at: '2024' };
    mockedApi.createProject.mockResolvedValueOnce(newProject);
    mockedApi.getProjects.mockResolvedValueOnce([newProject]);

    await act(async () => {
      await useProjectStore.getState().addProject({ name: 'P2' } as any);
    });

    expect(mockedApi.createProject).toHaveBeenCalledWith({ name: 'P2' });
    expect(mockedApi.getProjects).toHaveBeenCalled();
    expect(useProjectStore.getState().projects).toEqual([newProject]);
  });

  it('editProject updates existing project', async () => {
    useProjectStore.setState({
      ...initialState,
      projects: [{ id: 'p1', name: 'Old', created_at: '2024' }],
    } as any);
    const updated = { id: 'p1', name: 'New', created_at: '2024' };
    mockedApi.updateProject = vi.fn().mockResolvedValueOnce(updated);

    await act(async () => {
      await useProjectStore
        .getState()
        .editProject('p1', { name: 'New' } as any);
    });

    expect(useProjectStore.getState().projects[0].name).toBe('New');
  });

  it('setFilters merges and triggers fetch', async () => {
    mockedApi.getProjects.mockResolvedValueOnce([]);

    await act(async () => {
      useProjectStore.getState().setFilters({ status: 'active' });
    });

    expect(mockedApi.getProjects).toHaveBeenCalled();
    expect(useProjectStore.getState().filters.status).toBe('active');
  });

  it('archiveProject archives project and refreshes', async () => {
    useProjectStore.setState({
      ...initialState,
      projects: [
        { id: 'p1', name: 'P', created_at: '2024', is_archived: false },
      ],
    } as any);
    mockedApi.archiveProject = vi.fn().mockResolvedValueOnce({
      id: 'p1',
      name: 'P',
      is_archived: true,
    });
    mockedApi.getProjects.mockResolvedValueOnce([]);
    useTaskStore.setState({ archiveTasksByProjectId: vi.fn() } as any);

    await act(async () => {
      await useProjectStore.getState().archiveProject('p1');
    });

    expect(mockedApi.archiveProject).toHaveBeenCalledWith('p1');
    expect(
      useTaskStore.getState().archiveTasksByProjectId
    ).toHaveBeenCalledWith('p1');
  });

  it('unarchiveProject unarchives and refreshes', async () => {
    useProjectStore.setState({
      ...initialState,
      projects: [
        { id: 'p1', name: 'P', created_at: '2024', is_archived: true },
      ],
    } as any);
    mockedApi.unarchiveProject = vi.fn().mockResolvedValueOnce({
      id: 'p1',
      name: 'P',
      is_archived: false,
    });
    mockedApi.getProjects.mockResolvedValueOnce([]);
    useTaskStore.setState({ unarchiveTasksByProjectId: vi.fn() } as any);

    await act(async () => {
      await useProjectStore.getState().unarchiveProject('p1');
    });

    expect(mockedApi.unarchiveProject).toHaveBeenCalledWith('p1');
    expect(
      useTaskStore.getState().unarchiveTasksByProjectId
    ).toHaveBeenCalledWith('p1');
  });

  it('startPolling sets interval id', () => {
    vi.useFakeTimers();
    mockedApi.getProjects.mockResolvedValue([]);

    act(() => {
      useProjectStore.getState().startPolling();
    });

    expect(useProjectStore.getState().pollingIntervalId).not.toBeNull();

    act(() => {
      useProjectStore.getState().stopPolling();
    });

    expect(useProjectStore.getState().pollingIntervalId).toBeNull();
    vi.useRealTimers();
  });

  it('clearPollingError resets error field', () => {
    useProjectStore.setState({ pollingError: 'err' } as any);
    act(() => {
      useProjectStore.getState().clearPollingError();
    });
    expect(useProjectStore.getState().pollingError).toBeNull();
  });
});
