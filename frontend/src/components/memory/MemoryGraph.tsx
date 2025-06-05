"use client";

import React, { useEffect, useState } from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { ForceGraph2D } from "react-force-graph";
import { memoryApi } from "@/services/api";
import type { KnowledgeGraph } from "@/types/memory";

interface GraphData {
  nodes: { id: number; label: string }[];
  links: { source: number; target: number }[];
}

const MemoryGraph: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const graph: KnowledgeGraph = await memoryApi.getKnowledgeGraph();
        const nodes = graph.entities.map((e) => ({ id: e.id, label: e.entity_type }));
        const links = graph.relations.map((r) => ({ source: r.from_entity_id, target: r.to_entity_id }));
        setData({ nodes, links });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return (
      <Text color="textError" data-testid="graph-error">
        {error}
      </Text>
    );
  }

  return (
    <Box h="600px" data-testid="memory-graph">
      {data && <ForceGraph2D graphData={data} />}    
    </Box>
  );
};

export default MemoryGraph;
