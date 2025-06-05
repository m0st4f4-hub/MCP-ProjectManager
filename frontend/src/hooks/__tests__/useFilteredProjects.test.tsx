import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@/__tests__/utils/test-utils';
import { useFilteredProjects } from '../useFilteredProjects';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<any>('@chakra-ui/react');
  return { ...actual, useToast: vi.fn(), useColorModeValue: vi.fn((l: any) => l) };
});

const baseFilters = { is_archived: undefined, search: undefined, status: 'all', agentId: undefined };

describe('useFilteredProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const projects = [
    { id: '1', name: 'A', created_at: '', is_archived: false },
    { id: '2', name: 'B', created_at: '', is_archived: true },
  ];

  it('filters out archived projects by default', () => {
    const { result } = renderHook(() => useFilteredProjects(projects, baseFilters));
    expect(result.current).toEqual([projects[0]]);
  });

  it('returns project matching task view filter', () => {
    const { result } = renderHook(() =>
      useFilteredProjects(projects, { ...baseFilters, is_archived: null }, '2'),
    );
    expect(result.current).toEqual([projects[1]]);
  });
});
