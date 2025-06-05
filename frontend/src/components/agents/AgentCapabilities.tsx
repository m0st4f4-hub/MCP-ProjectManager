"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  HStack,
  Input,
} from "@chakra-ui/react";
import { agentRolesApi } from "@/services/api/agent_roles";
import type { AgentCapability } from "@/types/agent";

interface AgentCapabilitiesProps {
  roleName: string;
  roleId: string;
}

const AgentCapabilities: React.FC<AgentCapabilitiesProps> = ({ roleName, roleId }) => {
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCapabilities = async () => {
    try {
      const caps = await agentRolesApi.getCapabilities(roleName);
      setCapabilities(caps);
    } catch (err) {
      console.error("Failed to load capabilities", err);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, [roleName]);

  const handleAdd = async () => {
    if (!name) return;
    try {
      await agentRolesApi.addCapability(roleId, name, description);
      setName("");
      setDescription("");
      fetchCapabilities();
    } catch (err) {
      console.error("Failed to add capability", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await agentRolesApi.deleteCapability(id);
      fetchCapabilities();
    } catch (err) {
      console.error("Failed to delete capability", err);
    }
  };

  return (
    <Box p={4}>
      <HStack mb={4} spacing={2}>
        <Input
          placeholder="Capability"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="sm"
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="sm"
        />
        <Button onClick={handleAdd} size="sm" data-testid="add-capability">
          Add
        </Button>
      </HStack>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {capabilities.map((cap: any) => (
              <Tr key={cap.id ?? cap.name} data-testid="capability-row">
                <Td>{cap.name ?? cap.capability}</Td>
                <Td>{cap.description}</Td>
                <Td>
                  {cap.id && (
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDelete(cap.id)}
                    >
                      Remove
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AgentCapabilities;

