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
      100
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

  it('updateTask edits task via API', async () => {
    useTaskStore.setState({
      ...initialState,
      tasks: [
        {
          project_id: 'p1',
          task_number: 1,
          title: 'Old',
          status: TaskStatus.TO_DO,
          created_at: '2024',
        } as any,
      ],
    } as any);
    const updated = {
      project_id: 'p1',
      task_number: 1,
      title: 'Upd',
      status: TaskStatus.IN_PROGRESS,
      created_at: '2024',
    };
    mockedApi.updateTask = vi.fn().mockResolvedValueOnce(updated);

    await act(async () => {
      await useTaskStore
        .getState()
        .updateTask('p1', 1, { title: 'Upd' } as any);
    });

    expect(mockedApi.updateTask).toHaveBeenCalled();
    expect(useTaskStore.getState().tasks[0].title).toBe('Upd');
  });

  it('deleteTask removes task', async () => {
    useTaskStore.setState({
      ...initialState,
      tasks: [
        {
          project_id: 'p1',
          task_number: 1,
          title: 'T',
          status: TaskStatus.TO_DO,
        } as any,
      ],
      selectedTaskIds: ['p1-1'],
    } as any);
    mockedApi.deleteTask.mockResolvedValueOnce({} as any);

    await act(async () => {
      await useTaskStore.getState().deleteTask('p1', 1);
    });

    expect(mockedApi.deleteTask).toHaveBeenCalledWith('p1', 1);
    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(useTaskStore.getState().selectedTaskIds).toEqual([]);
  });

  it('open and close edit modal', () => {
    const task = { project_id: 'p1', task_number: 1 } as any;
    act(() => {
      useTaskStore.getState().openEditModal(task);
    });
    expect(useTaskStore.getState().editingTask).toEqual(task);
    expect(useTaskStore.getState().isEditModalOpen).toBe(true);
    act(() => {
      useTaskStore.getState().closeEditModal();
    });
    expect(useTaskStore.getState().editingTask).toBeNull();
    expect(useTaskStore.getState().isEditModalOpen).toBe(false);
  });

  it('setSortOptions updates and triggers fetch', async () => {
    mockedApi.getAllTasks.mockResolvedValueOnce([]);
    await act(async () => {
      useTaskStore
        .getState()
        .setSortOptions({ field: 'title', direction: 'asc' });
    });
    expect(mockedApi.getAllTasks).toHaveBeenCalled();
    expect(useTaskStore.getState().sortOptions.field).toBe('title');
  });

  it('setFilters merges filters and fetches', async () => {
    mockedApi.getAllTasks.mockResolvedValueOnce([]);
    await act(async () => {
      useTaskStore.getState().setFilters({ status: 'in_progress' } as any);
    });
    expect(mockedApi.getAllTasks).toHaveBeenCalled();
    expect(useTaskStore.getState().filters.status).toBe('in_progress');
  });

  it('selection helpers toggle ids', () => {
    act(() => {
      useTaskStore.getState().toggleTaskSelection('p1-1');
    });
    expect(useTaskStore.getState().selectedTaskIds).toEqual(['p1-1']);
    act(() => {
      useTaskStore.getState().toggleTaskSelection('p1-1');
    });
    expect(useTaskStore.getState().selectedTaskIds).toEqual([]);
  });

  it('selectAll and deselectAll work', () => {
    act(() => {
      useTaskStore.getState().selectAllTasks(['a', 'b']);
    });
    expect(useTaskStore.getState().selectedTaskIds).toEqual(['a', 'b']);
    act(() => {
      useTaskStore.getState().deselectAllTasks();
    });
    expect(useTaskStore.getState().selectedTaskIds).toEqual([]);
  });

  it('removeTasksByProjectId removes tasks', () => {
    useTaskStore.setState({
      ...initialState,
      tasks: [
        { project_id: 'p1', task_number: 1 } as any,
        { project_id: 'p2', task_number: 2 } as any,
      ],
      selectedTaskIds: ['p1-1', 'p2-2'],
    } as any);
    act(() => {
      useTaskStore.getState().removeTasksByProjectId('p1');
    });
    expect(useTaskStore.getState().tasks.length).toBe(1);
    expect(useTaskStore.getState().selectedTaskIds).toEqual(['p2-2']);
  });

  it('archive/unarchive tasks by project id', () => {
    useTaskStore.setState({
      ...initialState,
      tasks: [
        { project_id: 'p1', task_number: 1, is_archived: false } as any,
        { project_id: 'p1', task_number: 2, is_archived: false } as any,
      ],
    } as any);
    mockedApi.getAllTasks.mockResolvedValue([]);
    act(() => {
      useTaskStore.getState().archiveTasksByProjectId('p1');
    });
    expect(useTaskStore.getState().tasks.every((t) => t.is_archived)).toBe(
      true
    );
    act(() => {
      useTaskStore.getState().unarchiveTasksByProjectId('p1');
    });
    expect(useTaskStore.getState().tasks.every((t) => !t.is_archived)).toBe(
      true
    );
  });

  it('clear error helpers reset state', () => {
    useTaskStore.setState({
      error: 'e',
      pollingError: 'p',
      mutationError: { type: 'add', message: 'm' },
    } as any);
    act(() => {
      useTaskStore.getState().clearError();
      useTaskStore.getState().clearPollingError();
      useTaskStore.getState().clearMutationError();
    });
    expect(useTaskStore.getState().error).toBeNull();
    expect(useTaskStore.getState().pollingError).toBeNull();
    expect(useTaskStore.getState().mutationError).toBeNull();
  });

  it('getTaskById returns task', () => {
    useTaskStore.setState({
      ...initialState,
      tasks: [{ project_id: 'p1', task_number: 1 } as any],
    } as any);
    expect(useTaskStore.getState().getTaskById('p1', 1)).toBeDefined();
  });

  it('start and stop polling manage interval', () => {
    vi.useFakeTimers();
    mockedApi.getAllTasks.mockResolvedValue([]);
    mockedApi.getProjects.mockResolvedValue([]);
    mockedApi.getAgents.mockResolvedValue([]);
    act(() => {
      useTaskStore.getState().startPolling();
    });
    expect(useTaskStore.getState().pollingIntervalId).not.toBeNull();
    act(() => {
      useTaskStore.getState().stopPolling();
    });
    expect(useTaskStore.getState().pollingIntervalId).toBeNull();
    vi.useRealTimers();
  });
});
