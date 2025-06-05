import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@/__tests__/utils/test-utils';
import { useListMemory, useIngestFile, useCreateMemory } from '../useMemory';
import { memoryApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  memoryApi: {
    listEntities: vi.fn(),
    ingestFile: vi.fn(),
    createEntity: vi.fn(),
  },
}));

const mockedApi = vi.mocked(memoryApi);

describe('memory hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useListMemory fetches entities', async () => {
    const entities = [
      { id: 1, entity_type: 'file', content: 'a', created_at: '2024' },
    ];
    mockedApi.listEntities.mockResolvedValueOnce({ data: entities } as any);
    const { result } = renderHook(() => useListMemory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entities).toEqual(entities);
    expect(mockedApi.listEntities).toHaveBeenCalled();
  });

  it('useIngestFile calls API', async () => {
    const entity = { id: 2, entity_type: 'file', content: '', created_at: '2024' };
    mockedApi.ingestFile.mockResolvedValueOnce(entity as any);
    const { result } = renderHook(() => useIngestFile());

    await act(async () => {
      await result.current.ingestFile('/tmp/test.txt');
    });

    expect(mockedApi.ingestFile).toHaveBeenCalledWith('/tmp/test.txt');
  });

  it('useCreateMemory calls API', async () => {
    const entity = { id: 3, entity_type: 'note', content: 'x', created_at: '2024' };
    mockedApi.createEntity.mockResolvedValueOnce(entity as any);
    const { result } = renderHook(() => useCreateMemory());

    await act(async () => {
      await result.current.createMemory({ entity_type: 'note', content: 'x' });
    });

    expect(mockedApi.createEntity).toHaveBeenCalledWith({ entity_type: 'note', content: 'x' });
  });
});
