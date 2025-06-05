"use client";

import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { mcpApi } from "@/services/api/mcp";

const MCPMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mcpApi.metrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };
    load();
  }, []);

  return (
    <Box p={4} overflowX="auto">
      <Table size="sm" variant="simple">
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
    </Box>
  );
};

export default MCPMetrics;
