import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectData } from '../useProjectData';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<any>('@chakra-ui/react');
  return { ...actual, useToast: vi.fn(), useColorModeValue: vi.fn((l: any) => l) };
});

vi.mock('@/services/api/projects', () => ({
  getProjectById: vi.fn(),
  updateProject: vi.fn(),
}));

vi.mock('@/services/api/tasks', () => ({
  getAllTasksForProject: vi.fn(),
}));

import { getProjectById, updateProject } from '@/services/api/projects';
import { getAllTasksForProject } from '@/services/api/tasks';

const mockedProjects = vi.mocked({ getProjectById, updateProject });
const mockedTasks = vi.mocked({ getAllTasksForProject });

describe('useProjectData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches project and tasks on mount', async () => {
    mockedProjects.getProjectById.mockResolvedValueOnce({ id: '1', name: 'P', created_at: '' } as any);
    mockedTasks.getAllTasksForProject.mockResolvedValueOnce([{ id: 't1', project_id: '1', task_number: 1, title: 'T', status: 'todo', created_at: '' }] as any);

    const { result } = renderHook(() => useProjectData('1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedProjects.getProjectById).toHaveBeenCalledWith('1');
    expect(mockedTasks.getAllTasksForProject).toHaveBeenCalledWith('1');
    expect(result.current.project?.id).toBe('1');
    expect(result.current.tasks).toHaveLength(1);
  });

  it('updates project via save', async () => {
    mockedProjects.getProjectById.mockResolvedValueOnce({ id: '1', name: 'P', created_at: '' } as any);
    mockedTasks.getAllTasksForProject.mockResolvedValueOnce([]);
    mockedProjects.updateProject.mockResolvedValueOnce({ id: '1', name: 'Updated', created_at: '' } as any);

    const { result } = renderHook(() => useProjectData('1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.save({ name: 'Updated' });
    });

    expect(mockedProjects.updateProject).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(result.current.project?.name).toBe('Updated');
  });
});
