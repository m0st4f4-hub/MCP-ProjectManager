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
    }
  };

  useEffect(() => {
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
    }
  };

  const handleDelete = async (id: string) => {
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
    </Box>
  );
};

export default AgentCapabilities;
