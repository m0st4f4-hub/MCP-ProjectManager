<<<<<<< HEAD
"use client";

import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { mcpApi } from "@/services/api/mcp";
import { metricsApi } from "@/services/api/metrics";

const MCPMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [httpMetrics, setHttpMetrics] = useState<
    { endpoint: string; requests: number; errors: number }[]
  >([]);

  useEffect(() => {
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

    const load = async () => {
      try {
        const data = await mcpApi.metrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
      try {
        const raw = await metricsApi.raw();
        setHttpMetrics(parseMetrics(raw));
      } catch (err) {
        console.error("Failed to fetch HTTP metrics", err);
      }
    };
    load();
  }, []);

  return (
    <Box p={4} overflowX="auto">
      <Table size="sm" variant="simple" mb={4}>
        <Thead>
          <Tr>
            <Th>Tool</Th>
            <Th isNumeric>Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(metrics).map(([name, count]) => (
            <Tr key={name}>
              <Td>{name}</Td>
              <Td isNumeric>{count}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Table size="sm" variant="simple">
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
=======
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
>>>>>>> origin/codex/add-in-memory-counters-and-expose-metrics
    </Box>
  );
};

export default MCPMetrics;
