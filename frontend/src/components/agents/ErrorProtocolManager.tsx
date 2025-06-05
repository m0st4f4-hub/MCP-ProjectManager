"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import { errorProtocolsApi } from "@/services/api/error_protocols";
import type { ErrorProtocol, ErrorProtocolCreateData } from "@/types";

const ErrorProtocolManager: React.FC = () => {
  const [protocols, setProtocols] = useState<ErrorProtocol[]>([]);
  const [errorType, setErrorType] = useState("");
  const [protocolText, setProtocolText] = useState("");
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await errorProtocolsApi.list();
        setProtocols(data);
      } catch (err) {
        toast({
          title: "Failed to load protocols",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    load();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProtocol: ErrorProtocolCreateData = {
      agent_role_id: "default",
      error_type: errorType,
      protocol: protocolText,
      priority: 5,
    };
    try {
      const created = await errorProtocolsApi.create(newProtocol);
      setProtocols((prev) => [...prev, created]);
      setErrorType("");
      setProtocolText("");
      toast({ title: "Protocol added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Error adding protocol", status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await errorProtocolsApi.remove(id);
      setProtocols((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Protocol deleted", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: "Error deleting protocol", status: "error", duration: 5000, isClosable: true });
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      <Box as="form" onSubmit={handleSubmit} mb={4}>
        <Input
          placeholder="Error Type"
          value={errorType}
          onChange={(e) => setErrorType(e.target.value)}
          mb={2}
        />
        <Textarea
          placeholder="Protocol"
          value={protocolText}
          onChange={(e) => setProtocolText(e.target.value)}
          mb={2}
        />
        <Button type="submit" colorScheme="blue" isDisabled={!errorType || !protocolText}>
          Add Protocol
        </Button>
      </Box>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Error Type</Th>
            <Th>Protocol</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {protocols.map((p) => (
            <Tr key={p.id} data-testid="protocol-row">
              <Td>{p.error_type}</Td>
              <Td>{p.protocol}</Td>
              <Td>
                <Button size="xs" onClick={() => handleDelete(p.id)}>
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
