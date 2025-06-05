import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useTaskStore } from '../taskStore';
import * as api from '@/services/api';
import { TaskStatus } from '@/types/task';

vi.mock('@/services/api', () => ({
  getAllTasks: vi.fn(),
  createTask: vi.fn(),
  getProjects: vi.fn(),
  getAgents: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockedApi = vi.mocked(api as any);

const initialState = {
  tasks: [],
  loading: false,
  isPolling: false,
  error: null,
  pollingError: null,
  mutationError: null,
  editingTask: null,
  isEditModalOpen: false,
  sortOptions: { field: 'created_at', direction: 'desc' },
  filters: {
    top_level_only: true,
    hideCompleted: false,
    is_archived: false,
    projectId: undefined,
    agentId: undefined,
    status: 'all',
    search: undefined,
  },
  projects: [],
  agents: [],
  pollingIntervalId: null,
  selectedTaskIds: [],
};

describe('taskStore', () => {
  beforeEach(() => {
    useTaskStore.setState(initialState as any);
    vi.clearAllMocks();
  });

  it('fetchTasks loads tasks from API', async () => {
    const tasks = [
      {
        project_id: 'p1',
        task_number: 1,
        title: 'T1',
        status: TaskStatus.TO_DO,
        created_at: '2024',
      },
    ];
    mockedApi.getAllTasks.mockResolvedValueOnce(tasks);

    await act(async () => {
      await useTaskStore.getState().fetchTasks();
    });

    expect(mockedApi.getAllTasks).toHaveBeenCalledWith(
      initialState.filters,
      initialState.sortOptions,
      0,
      100,
    );
    expect(useTaskStore.getState().tasks).toEqual(tasks);
  });

  it('addTask adds task and calls API', async () => {
    const newTask = {
      project_id: 'p1',
      task_number: 2,
      title: 'New',
      status: TaskStatus.TO_DO,
      created_at: '2024',
    };
    mockedApi.createTask.mockResolvedValueOnce(newTask);
    mockedApi.getProjects.mockResolvedValueOnce([]);
    mockedApi.getAgents.mockResolvedValueOnce([]);

    await act(async () => {
      await useTaskStore
        .getState()
        .addTask({ project_id: 'p1', title: 'New' } as any);
    });

    expect(mockedApi.createTask).toHaveBeenCalledWith('p1', {
      project_id: 'p1',
      title: 'New',
    });
    expect(useTaskStore.getState().tasks[0]).toEqual(newTask);
  });

  it('rehydrates tasks from localStorage', async () => {
    vi.resetModules();
    const tasks = [
      {
        project_id: 'p1',
        task_number: 3,
        title: 'Persisted',
        status: TaskStatus.TO_DO,
        created_at: '2024',
      },
    ];
    localStorage.setItem(
      'task-store',
      JSON.stringify({ state: { ...initialState, tasks }, version: 1 })
    );
    const { useTaskStore: rehydrated } = await import('../taskStore');
    expect(rehydrated.getState().tasks).toEqual(tasks);
  });
});
