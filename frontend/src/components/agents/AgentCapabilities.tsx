<<<<<<< HEAD
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import { agentCapabilitiesApi } from '@/services/api';
import type { AgentCapability } from '@/types/agents';

interface AgentCapabilitiesProps {
  agentRoleId: string;
}

const AgentCapabilities: React.FC<AgentCapabilitiesProps> = ({
  agentRoleId,
}) => {
  const toast = useToast();
  const [capabilities, setCapabilities] = useState<AgentCapability[] | null>(
    null
  );
  const [newCap, setNewCap] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCap, setEditCap] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const loadCapabilities = async () => {
    try {
      const data = await agentCapabilitiesApi.list(agentRoleId);
      setCapabilities(data);
    } catch (err) {
      toast({
        title: 'Failed to load capabilities',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
=======
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
>>>>>>> origin/codex/add-agentcapabilities-component-and-api-integration
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    loadCapabilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleCreate = async () => {
    if (!newCap.trim()) return;
    setLoading(true);
    try {
      await agentCapabilitiesApi.create(agentRoleId, {
        capability: newCap,
        description: newDesc || undefined,
      });
      setNewCap('');
      setNewDesc('');
      await loadCapabilities();
      toast({
        title: 'Capability added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to add capability',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
=======
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
>>>>>>> origin/codex/add-agentcapabilities-component-and-api-integration
    }
  };

  const handleDelete = async (id: string) => {
<<<<<<< HEAD
    setLoading(true);
    try {
      await agentCapabilitiesApi.delete(id);
      await loadCapabilities();
      toast({
        title: 'Capability removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to remove capability',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cap: AgentCapability) => {
    setEditingId(cap.id);
    setEditCap(cap.capability);
    setEditDesc(cap.description || '');
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    try {
      await agentCapabilitiesApi.update(id, {
        capability: editCap,
        description: editDesc || undefined,
      });
      setEditingId(null);
      await loadCapabilities();
      toast({
        title: 'Capability updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to update capability',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!capabilities) {
    return (
      <Flex justify="center" align="center" p="4" minH="100px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={2} gap={2} flexWrap="wrap">
        <Input
          placeholder="Capability"
          value={newCap}
          onChange={(e) => setNewCap(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <Button
          onClick={handleCreate}
          isLoading={loading}
          disabled={!newCap.trim()}
        >
          Add
        </Button>
      </Flex>
      {capabilities.length === 0 ? (
        <Text>No capabilities.</Text>
      ) : (
        <List spacing={2}>
          {capabilities.map((cap) => (
            <ListItem key={cap.id} borderWidth="1px" borderRadius="md" p={2}>
              {editingId === cap.id ? (
                <Flex gap={2} flexWrap="wrap">
                  <Input
                    value={editCap}
                    onChange={(e) => setEditCap(e.target.value)}
                  />
                  <Input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(cap.id)}
                    isLoading={loading}
                  >
                    Save
                  </Button>
                  <Button size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </Flex>
              ) : (
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{cap.capability}</Text>
                    {cap.description && (
                      <Text fontSize="sm">{cap.description}</Text>
                    )}
                  </Box>
                  <Flex gap={2}>
                    <Button size="sm" onClick={() => startEdit(cap)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(cap.id)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              )}
            </ListItem>
          ))}
        </List>
      )}
=======
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
>>>>>>> origin/codex/add-agentcapabilities-component-and-api-integration
    </Box>
  );
};

export default AgentCapabilities;
<<<<<<< HEAD
=======

>>>>>>> origin/codex/add-agentcapabilities-component-and-api-integration
