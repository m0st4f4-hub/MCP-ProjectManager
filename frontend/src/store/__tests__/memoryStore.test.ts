import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useMemoryStore } from '../memoryStore';
import { memoryApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  memoryApi: {
    listEntities: vi.fn(),
    ingestFile: vi.fn(),
    uploadFile: vi.fn(),
    ingestUrl: vi.fn(),
    ingestText: vi.fn(),
    deleteEntity: vi.fn(),
  },
}));

const mockedApi = vi.mocked(memoryApi);

const initialState = {
  entities: [],
  ingestionLoading: false,
  ingestionError: null,
  loading: false,
  error: null,
};

describe('memoryStore', () => {
  beforeEach(() => {
    useMemoryStore.setState({
      ...initialState,
      clearError: useMemoryStore.getState().clearError,
    } as any);
    vi.clearAllMocks();
  });

  it('fetchEntities loads entities from API', async () => {
    const entities = [
      { id: 1, entity_type: 'file', content: 'a', created_at: '2024-01-01' },
    ];
    mockedApi.listEntities.mockResolvedValueOnce({ data: entities } as any);

    await act(async () => {
      await useMemoryStore.getState().fetchEntities();
    });

    expect(mockedApi.listEntities).toHaveBeenCalled();
    expect(useMemoryStore.getState().entities).toEqual(entities);
    expect(useMemoryStore.getState().loading).toBe(false);
  });

  it('ingestFile prepends new entity', async () => {
    const entity = {
      id: 2,
      entity_type: 'file',
      content: 'b',
      created_at: '2024',
    };
    mockedApi.ingestFile.mockResolvedValueOnce(entity as any);

    await act(async () => {
      await useMemoryStore.getState().ingestFile('/tmp/test.txt');
    });

    expect(mockedApi.ingestFile).toHaveBeenCalledWith('/tmp/test.txt');
    expect(useMemoryStore.getState().entities[0]).toEqual(entity);
    expect(useMemoryStore.getState().ingestionLoading).toBe(false);
  });

  it('uploadFile prepends new entity', async () => {
    const entity = {
      id: 5,
      entity_type: 'file',
      content: 'c',
      created_at: '2024',
    };
    (mockedApi.uploadFile as any).mockResolvedValueOnce(entity);

    await act(async () => {
      await useMemoryStore.getState().uploadFile(new File(['c'], 'c.txt'));
    });

    expect(mockedApi.uploadFile).toHaveBeenCalled();
    expect(useMemoryStore.getState().entities[0]).toEqual(entity);
  });

  it('deleteEntity removes entity', async () => {
    useMemoryStore.setState({
      ...initialState,
      entities: [
        { id: 3, entity_type: 'file', content: '', created_at: '2024' },
      ],
    } as any);
    mockedApi.deleteEntity.mockResolvedValueOnce();

    await act(async () => {
      await useMemoryStore.getState().deleteEntity(3);
    });

    expect(mockedApi.deleteEntity).toHaveBeenCalledWith(3);
    expect(useMemoryStore.getState().entities).toEqual([]);
  });
});
