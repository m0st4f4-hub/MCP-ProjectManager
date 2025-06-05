import { useState, useEffect, useCallback } from 'react';
import { memoryApi } from '@/services/api';
import type {
  MemoryEntity,
  MemoryEntityCreateData,
  MemoryEntityFilters,
} from '@/types/memory';

export interface UseCreateMemoryResult {
  createMemory: (data: MemoryEntityCreateData) => Promise<MemoryEntity>;
  loading: boolean;
  error: string | null;
}

export const useCreateMemory = (): UseCreateMemoryResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMemory = useCallback(async (data: MemoryEntityCreateData) => {
    setLoading(true);
    setError(null);
    try {
      const entity = await memoryApi.createEntity(data);
      return entity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create memory');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createMemory, loading, error };
};

export interface UseIngestFileResult {
  ingestFile: (path: string) => Promise<MemoryEntity>;
  loading: boolean;
  error: string | null;
}

export const useIngestFile = (): UseIngestFileResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingestFile = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const entity = await memoryApi.ingestFile(path);
      return entity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ingestFile, loading, error };
};

export interface UseListMemoryResult {
  entities: MemoryEntity[];
  loading: boolean;
  error: string | null;
  refresh: (f?: MemoryEntityFilters & { skip?: number; limit?: number }) => Promise<void>;
}

export const useListMemory = (
  filters?: MemoryEntityFilters & { skip?: number; limit?: number },
): UseListMemoryResult => {
  const [entities, setEntities] = useState<MemoryEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = useCallback(
    async (f?: MemoryEntityFilters & { skip?: number; limit?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await memoryApi.listEntities({ ...filters, ...f });
        setEntities(resp.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load memory');
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  return { entities, loading, error, refresh: fetchEntities };
};

