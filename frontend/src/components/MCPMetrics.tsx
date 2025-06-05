"use client";
import * as logger from '@/utils/logger';

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
        logger.error("Failed to fetch metrics", err);
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
    </Box>
  );
};

export default MCPMetrics;
