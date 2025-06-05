'use client';

import React, { useEffect, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import ForceGraph2D from 'react-force-graph-2d';
import { mcpApi } from '@/services/api';
import type { KnowledgeGraph } from '@/types/memory';

const GraphPage: React.FC = () => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const resp = await mcpApi.memory.getKnowledgeGraph();
        const data = (resp as any).data ?? resp;
        setGraph(data as KnowledgeGraph);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (!graph) {
    return <Box p={4}>No graph data.</Box>;
  }

  const nodes = graph.entities.map((e) => ({ id: e.id, name: e.entity_type }));
  const links = graph.relations.map((r) => ({
    source: r.from_entity_id,
    target: r.to_entity_id,
  }));

  return (
    <Box p={4} width="full" height="600px" data-testid="graph-container">
      <ForceGraph2D graphData={{ nodes, links }} />
    </Box>
  );
};

export default GraphPage;
