'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Spinner } from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import type { KnowledgeGraph } from '@/types/memory';

const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

const MemoryGraph: React.FC = () => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    memoryApi
      .getKnowledgeGraph()
      .then((g) => setGraph(g))
      .catch(() => setError('Failed to load memory graph'));
  }, []);

  if (error) {
    return <Box>{error}</Box>;
  }

  if (!graph) {
    return <Spinner />;
  }

  const nodes = graph.entities.map((e) => ({ id: e.id, name: e.entity_type }));
  const links = graph.relations.map((r) => ({
    source: r.from_entity_id,
    target: r.to_entity_id,
  }));

  return (
    <Box height="600px" width="100%">
      <ForceGraph2D graphData={{ nodes, links }} />
    </Box>
  );
};

export default MemoryGraph;
