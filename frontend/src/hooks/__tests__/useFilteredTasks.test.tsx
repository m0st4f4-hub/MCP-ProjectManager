import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredTasks } from '../useFilteredTasks';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<any>('@chakra-ui/react');
  return { ...actual, useToast: vi.fn(), useColorModeValue: vi.fn((l: any) => l) };
});

const baseFilters = {
  status: 'all' as const,
  hideCompleted: false,
  is_archived: undefined,
  projectId: undefined,
  agentId: undefined,
  search: undefined,
  top_level_only: true,
};

describe('useFilteredTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const tasks = [
    { id: '1-1', project_id: '1', task_number: 1, title: 'A', status: 'todo', created_at: '', is_archived: false },
    { id: '1-2', project_id: '1', task_number: 2, title: 'B', status: 'completed', created_at: '', is_archived: false },
    { id: '2-1', project_id: '2', task_number: 1, title: 'C', status: 'todo', created_at: '', is_archived: true },
  ] as any;

  it('filters out archived tasks by default', () => {
    const { result } = renderHook(() => useFilteredTasks(tasks, baseFilters));
    expect(result.current).toHaveLength(2);
    expect(result.current.every(t => !t.is_archived)).toBe(true);
  });

  it('filters by project id', () => {
    const { result } = renderHook(() => useFilteredTasks(tasks, { ...baseFilters, projectId: '1' }));
    expect(result.current).toEqual([tasks[0], tasks[1]]);
  });
});
