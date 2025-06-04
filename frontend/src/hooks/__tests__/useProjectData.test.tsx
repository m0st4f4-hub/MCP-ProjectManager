import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectData } from '../useProjectData';
import { TaskStatus } from '@/types/task';
import * as api from '@/services/api';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<any>('@chakra-ui/react');
  return { ...actual, useToast: vi.fn(), useColorModeValue: vi.fn((l: any) => l) };
});

vi.mock('@/services/api', () => ({
  getProjectById: vi.fn(),
  getAllTasksForProject: vi.fn(),
  updateProject: vi.fn(),
}));

const mockedApi = vi.mocked(api as any);

describe('useProjectData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads project and tasks on mount', async () => {
    const project = { id: 'p1', name: 'Project 1', created_at: '2024' } as any;
    const tasks = [
      { id: 't1', project_id: 'p1', task_number: 1, title: 'T1', status: TaskStatus.TO_DO, created_at: '2024' } as any,
    ];
    mockedApi.getProjectById.mockResolvedValueOnce(project);
    mockedApi.getAllTasksForProject.mockResolvedValueOnce(tasks);

    const { result } = renderHook(() => useProjectData('p1'));

    await waitFor(() => expect(result.current.project).toEqual(project));
    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.error).toBeNull();
  });

  it('updates project details', async () => {
    const project = { id: 'p1', name: 'Project 1', created_at: '2024' } as any;
    const updated = { ...project, name: 'Updated' };
    mockedApi.getProjectById.mockResolvedValue(project);
    mockedApi.getAllTasksForProject.mockResolvedValue([]);
    mockedApi.updateProject.mockResolvedValue(updated);

    const { result } = renderHook(() => useProjectData('p1'));
    await waitFor(() => expect(result.current.project).toEqual(project));

    await act(async () => {
      await result.current.updateProjectDetails({ name: 'Updated' } as any);
    });

    expect(mockedApi.updateProject).toHaveBeenCalledWith('p1', { name: 'Updated' });
    expect(result.current.project).toEqual(updated);
  });
});
