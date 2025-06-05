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
import { capabilitiesApi } from '@/services/api';
import type { Capability } from '@/types/capability';

interface AgentCapabilitiesProps {
  agentRoleId: string;
}

const AgentCapabilities: React.FC<AgentCapabilitiesProps> = ({
  agentRoleId,
}) => {
  const toast = useToast();
  const [capabilities, setCapabilities] = useState<Capability[] | null>(null);
  const [newCap, setNewCap] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCapabilities = async () => {
    try {
      const data = await capabilitiesApi.list(agentRoleId);
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
      await capabilitiesApi.create(agentRoleId, {
        agent_role_id: agentRoleId,
        capability: newCap,
      });
      setNewCap('');
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
      await capabilitiesApi.delete(id);
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

  if (!capabilities) {
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
          placeholder="New capability"
          value={newCap}
          onChange={(e) => setNewCap(e.target.value)}
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
              <Flex justify="space-between" align="center">
                <Text>{cap.capability}</Text>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(cap.id)}
                >
                  Delete
                </Button>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AgentCapabilities;
