import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKnowledgeGraph } from '../useKnowledgeGraph';
import { memoryApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  memoryApi: {
    getKnowledgeGraph: vi.fn(),
  },
}));

const mockGraph = { entities: [], relations: [] };

describe('useKnowledgeGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (memoryApi.getKnowledgeGraph as any).mockResolvedValue(mockGraph);
  });

  it('fetches graph on mount', async () => {
    const { result } = renderHook(() => useKnowledgeGraph({ limit: 5 }));

    await waitFor(() => expect(result.current.graph).toEqual(mockGraph));
    expect(memoryApi.getKnowledgeGraph).toHaveBeenCalledWith({
      entity_type: undefined,
      relation_type: undefined,
      limit: 5,
      offset: undefined,
    });
  });

  it('loads more data', async () => {
    const { result } = renderHook(() => useKnowledgeGraph({ limit: 5 }));
    await waitFor(() => expect(result.current.graph).toEqual(mockGraph));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(memoryApi.getKnowledgeGraph).toHaveBeenLastCalledWith({
      entity_type: undefined,
      relation_type: undefined,
      limit: 5,
      offset: 5,
    });
  });
});
