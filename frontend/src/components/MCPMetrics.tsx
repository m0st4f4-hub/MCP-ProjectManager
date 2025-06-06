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
  VStack,
} from '@chakra-ui/react';
import { mcpApi } from '@/services/api';
import { metricsApi } from '@/services/api/metrics';
import * as logger from '@/utils/logger';

const MCPMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [httpMetrics, setHttpMetrics] = useState<
    { endpoint: string; requests: number; errors: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseMetrics = (raw: string) => {
    const reqRe = /http_requests_total\{method="(\w+)",endpoint="([^\"]+)",status="(\d+)"\}\s+(\d+(?:\.\d+)?)/g;
    const errRe = /http_errors_total\{method="(\w+)",endpoint="([^\"]+)",status="(\d+)"\}\s+(\d+(?:\.\d+)?)/g;
    const map: Record<string, { endpoint: string; requests: number; errors: number }> = {};
    let m: RegExpExecArray | null;
    
    while ((m = reqRe.exec(raw))) {
      const ep = m[2];
      const val = parseFloat(m[4]);
      map[ep] = map[ep] || { endpoint: ep, requests: 0, errors: 0 };
      map[ep].requests += val;
    }
    
    while ((m = errRe.exec(raw))) {
      const ep = m[2];
      const val = parseFloat(m[4]);
      map[ep] = map[ep] || { endpoint: ep, requests: 0, errors: 0 };
      map[ep].errors += val;
    }
    
    return Object.values(map);
  };

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch MCP tool metrics
      const data = await mcpApi.metrics();
      setMetrics(data);
      
      // Fetch HTTP metrics if available
      try {
        const raw = await metricsApi.raw();
        setHttpMetrics(parseMetrics(raw));
      } catch (httpErr) {
        logger.error('Failed to fetch HTTP metrics', httpErr);
        // Don't fail completely if HTTP metrics fail
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(errorMsg);
      logger.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricEntries = Object.entries(metrics).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500" mb={2}>
          {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        {/* MCP Tool Metrics */}
        <Box>
          <Heading size="md" mb={4}>
            MCP Tool Metrics
          </Heading>
          {metricEntries.length > 0 ? (
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
          ) : (
            <Text>No tool metrics yet.</Text>
          )}
        </Box>

        {/* HTTP Endpoint Metrics */}
        {httpMetrics.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              HTTP Endpoint Metrics
            </Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Endpoint</Th>
                  <Th isNumeric>Requests</Th>
                  <Th isNumeric>Errors</Th>
                </Tr>
              </Thead>
              <Tbody>
                {httpMetrics.map((m) => (
                  <Tr key={m.endpoint}>
                    <Td>{m.endpoint}</Td>
                    <Td isNumeric>{m.requests}</Td>
                    <Td isNumeric>{m.errors}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MCPMetrics; 