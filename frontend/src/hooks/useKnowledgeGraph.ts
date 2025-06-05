import { useState, useEffect, useCallback } from 'react';
import { memoryApi } from '@/services/api';
import type { KnowledgeGraph } from '@/types/memory';

export interface UseKnowledgeGraphOptions {
  entityType?: string;
  relationType?: string;
  limit?: number;
  offset?: number;
}

export interface UseKnowledgeGraphResult {
  graph: KnowledgeGraph | null;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Fetch the knowledge graph with pagination support.
 */
export const useKnowledgeGraph = (
  options: UseKnowledgeGraphOptions = {}
): UseKnowledgeGraphResult => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UseKnowledgeGraphOptions>(options);

  const fetchGraph = useCallback(
    async (o: UseKnowledgeGraphOptions = params) => {
      setLoading(true);
      setError(null);
      try {
        const data = await memoryApi.getKnowledgeGraph({
          entity_type: o.entityType,
          relation_type: o.relationType,
          limit: o.limit,
          offset: o.offset,
        });
        setGraph(data);
        setParams(o);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load graph';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchGraph(options);
  }, [options, fetchGraph]);

  const loadMore = useCallback(async () => {
    const next = {
      ...params,
      offset: (params.offset || 0) + (params.limit || 100),
    };
    await fetchGraph(next);
  }, [params, fetchGraph]);

  return { graph, loading, error, loadMore, refresh: () => fetchGraph(params) };
};

export default useKnowledgeGraph;
