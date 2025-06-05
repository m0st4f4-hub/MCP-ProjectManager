"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableContainer,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  createAgentHandoffCriteria,
  listAgentHandoffCriteria,
  deleteAgentHandoffCriteria,
} from "@/services/api/agent_handoff_criteria";
import type { AgentHandoffCriteria } from "@/types/agents";

interface AgentHandoffManagerProps {
  agentRoleId: string;
}

const AgentHandoffManager: React.FC<AgentHandoffManagerProps> = ({ agentRoleId }) => {
  const toast = useToast();
  const [criteria, setCriteria] = useState<AgentHandoffCriteria[] | null>(null);
  const [newCriteria, setNewCriteria] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCriteria = async () => {
    try {
      const data = await listAgentHandoffCriteria(agentRoleId);
      setCriteria(data);
    } catch (err) {
      toast({
        title: "Failed to load criteria",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadCriteria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleCreate = async () => {
    if (!newCriteria.trim()) return;
    setLoading(true);
    try {
      await createAgentHandoffCriteria({
        agent_role_id: agentRoleId,
        criteria: newCriteria,
      });
      setNewCriteria("");
      await loadCriteria();
      toast({ title: "Criteria added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to add criteria",
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
      await deleteAgentHandoffCriteria(id);
      await loadCriteria();
      toast({ title: "Criteria removed", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to remove criteria",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!criteria) {
    return (
      <Flex justify="center" align="center" p="4" minH="100px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={2} gap={2}>
        <Input
          placeholder="New criteria"
          value={newCriteria}
          onChange={(e) => setNewCriteria(e.target.value)}
        />
        <Button onClick={handleCreate} isLoading={loading} disabled={!newCriteria.trim()}>
          Add
        </Button>
      </Flex>
      {criteria.length === 0 ? (
        <Text>No handoff criteria.</Text>
      ) : (
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Criteria</Th>
                <Th>Description</Th>
                <Th>Target Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {criteria.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.criteria}</Td>
                  <Td>{c.description || "-"}</Td>
                  <Td>{c.target_agent_role || "-"}</Td>
                  <Td>
                    <Button size="sm" colorScheme="red" onClick={() => handleDelete(c.id)}>
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AgentHandoffManager;
