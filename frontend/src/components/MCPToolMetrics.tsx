"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
} from "@chakra-ui/react";
import { mcpApi } from "@/services/api/mcp";

const MCPToolMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await mcpApi.tools.metrics();
        setMetrics(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
        <Text mt={2}>Loading Metrics...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth={1} borderRadius="md">
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        MCP Tool Metrics
      </Heading>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Tool</Th>
              <Th isNumeric>Invocations</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(metrics).map(([tool, count]) => (
              <Tr key={tool}>
                <Td>{tool}</Td>
                <Td isNumeric>{count}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MCPToolMetrics;
