'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import type { MemoryRelation } from '@/types/memory';
import { Network } from 'vis-network/standalone/esm/vis-network';

const RelationsGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network>();
  const [relations, setRelations] = useState<MemoryRelation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    memoryApi
      .getRelations()
      .then((r) => setRelations((r as any).data ?? r))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Failed to load relations'
        )
      );
  }, []);

  useEffect(() => {
    if (relations && containerRef.current) {
      const nodeIds = new Set<number>();
      const edges = relations.map((rel) => {
        nodeIds.add(rel.from_entity_id);
        nodeIds.add(rel.to_entity_id);
        return { from: rel.from_entity_id, to: rel.to_entity_id };
      });
      const nodes = Array.from(nodeIds).map((id) => ({ id }));
      networkRef.current = new Network(
        containerRef.current,
        { nodes, edges },
        {}
      );
    }
    return () => {
      networkRef.current?.destroy();
    };
  }, [relations]);

  if (error) {
    return <Box>{error}</Box>;
  }

  if (!relations) {
    return <Spinner />;
  }

  return <Box ref={containerRef} height="600px" width="100%" data-testid="relation-graph" />;
};

export default RelationsGraph;
