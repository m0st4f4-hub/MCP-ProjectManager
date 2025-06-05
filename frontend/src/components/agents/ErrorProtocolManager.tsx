"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { errorProtocolsApi } from "@/services/api";
import type { ErrorProtocol } from "@/types/agents";

interface ErrorProtocolManagerProps {
  agentRoleId: string;
}

const ErrorProtocolManager: React.FC<ErrorProtocolManagerProps> = ({ agentRoleId }) => {
  const toast = useToast();
  const [protocols, setProtocols] = useState<ErrorProtocol[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState("");
  const [protocol, setProtocol] = useState("");
  const [editing, setEditing] = useState<ErrorProtocol | null>(null);

  const loadProtocols = async () => {
    try {
      const data = await errorProtocolsApi.list(agentRoleId);
      setProtocols(data);
    } catch (err) {
      toast({
        title: "Failed to load protocols",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadProtocols();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleCreate = async () => {
    if (!errorType.trim() || !protocol.trim()) return;
    setLoading(true);
    try {
      await errorProtocolsApi.create({
        agent_role_id: agentRoleId,
        error_type: errorType,
        protocol,
      });
      setErrorType("");
      setProtocol("");
      await loadProtocols();
      toast({ title: "Protocol added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to add protocol",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      await errorProtocolsApi.update(editing.id, {
        error_type: editing.error_type,
        protocol: editing.protocol,
      });
      setEditing(null);
      await loadProtocols();
      toast({ title: "Protocol updated", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to update protocol",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await errorProtocolsApi.delete(id);
      await loadProtocols();
      toast({ title: "Protocol deleted", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to delete protocol",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!protocols) {
    return (
      <Flex justify="center" align="center" p={4} minH="100px">
        <Spinner />
      </Flex>
    );
  }

  const isSubmitDisabled = editing
    ? !editing.error_type.trim() || !editing.protocol.trim()
    : !errorType.trim() || !protocol.trim();

  return (
    <Box>
      <Flex
        mb={2}
        gap={2}
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          editing ? handleUpdate() : handleCreate();
        }}
      >
        <FormControl>
          <FormLabel>Error Type</FormLabel>
          <Input
            placeholder="e.g. PlanError"
            value={editing ? editing.error_type : errorType}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, error_type: e.target.value })
                : setErrorType(e.target.value)
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel>Protocol</FormLabel>
          <Input
            placeholder="Resolution steps"
            value={editing ? editing.protocol : protocol}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, protocol: e.target.value })
                : setProtocol(e.target.value)
            }
          />
        </FormControl>
        <Button type="submit" isLoading={loading} isDisabled={isSubmitDisabled}>
          {editing ? "Save" : "Add"}
        </Button>
        {editing && (
          <Button onClick={() => setEditing(null)} isDisabled={loading}>
            Cancel
          </Button>
        )}
      </Flex>
      {protocols.length === 0 ? (
        <Text>No error protocols.</Text>
      ) : (
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
              <Tr key={p.id}>
                <Td>{p.error_type}</Td>
                <Td>{p.protocol}</Td>
                <Td>
                  <Button size="sm" mr={2} onClick={() => setEditing(p)}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(p.id)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ErrorProtocolManager;
