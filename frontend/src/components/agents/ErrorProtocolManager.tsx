"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import type { ErrorProtocol } from "@/types/error_protocol";
import { errorProtocolsApi } from "@/services/api/errorProtocols";

interface ErrorProtocolManagerProps {
  agentRoleId: string;
}

const ErrorProtocolManager: React.FC<ErrorProtocolManagerProps> = ({ agentRoleId }) => {
  const [protocols, setProtocols] = useState<ErrorProtocol[]>([]);
  const [errorType, setErrorType] = useState("");
  const [protocolText, setProtocolText] = useState("");
  const toast = useToast();

  const fetchProtocols = async () => {
    try {
      const list = await errorProtocolsApi.list(agentRoleId);
      setProtocols(list);
    } catch (err) {
      toast({
        title: "Failed to fetch protocols",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, [agentRoleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorType.trim() || !protocolText.trim()) return;
    try {
      const created = await errorProtocolsApi.create(agentRoleId, {
        error_type: errorType,
        protocol: protocolText,
        priority: 5,
        is_active: true,
      });
      setProtocols((prev) => [...prev, created]);
      setErrorType("");
      setProtocolText("");
      toast({ title: "Protocol added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to add protocol",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await errorProtocolsApi.remove(id);
      setProtocols((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Protocol removed", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to remove protocol",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Box as="form" onSubmit={handleSubmit} mb={4}>
        <Flex gap={2} mb={2}>
          <Input
            placeholder="Error Type"
            value={errorType}
            onChange={(e) => setErrorType(e.target.value)}
          />
          <Input
            placeholder="Protocol"
            value={protocolText}
            onChange={(e) => setProtocolText(e.target.value)}
          />
          <Button type="submit" colorScheme="blue">
            Add
          </Button>
        </Flex>
      </Box>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Error Type</Th>
            <Th>Protocol</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {protocols.map((p) => (
            <Tr key={p.id}>
              <Td>{p.error_type}</Td>
              <Td>{p.protocol}</Td>
              <Td>
                <Button size="xs" colorScheme="red" onClick={() => handleDelete(p.id)}>
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ErrorProtocolManager;
