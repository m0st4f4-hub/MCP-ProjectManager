'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { mcpApi } from '@/services/api';

const MCPMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mcpApi.metrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricEntries = Object.entries(metrics).sort((a, b) => b[1] - a[1]);

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        MCP Tool Metrics
      </Heading>
      {loading && <Spinner />}
      {error && (
        <Text color="red.500" mb={2}>
          {error}
        </Text>
      )}
      {!loading && metricEntries.length > 0 && (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Tool</Th>
              <Th isNumeric>Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {metricEntries.map(([tool, count]) => (
              <Tr key={tool}>
                <Td>{tool}</Td>
                <Td isNumeric>{count}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {!loading && metricEntries.length === 0 && <Text>No metrics yet.</Text>}
    </Box>
  );
};

export default MCPMetrics;
