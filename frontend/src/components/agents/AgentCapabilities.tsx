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
  VStack,
  HStack,
  IconButton,
  Textarea,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
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
      <VStack spacing={4} align="stretch">
        {/* Add new capability form */}
        <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            Add New Capability
          </Text>
          <VStack spacing={2}>
            <Input
              placeholder="Capability name"
              value={newCap}
              onChange={(e) => setNewCap(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <Button
              onClick={handleCreate}
              isLoading={loading}
              isDisabled={!newCap.trim()}
              colorScheme="blue"
              w="full"
            >
              Add Capability
            </Button>
          </VStack>
        </Box>

        {/* Capabilities list */}
        <List spacing={2}>
          {capabilities.map((cap) => (
            <ListItem
              key={cap.id}
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              {editingId === cap.id ? (
                <VStack spacing={2} align="stretch">
                  <Input
                    value={editCap}
                    onChange={(e) => setEditCap(e.target.value)}
                  />
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<CheckIcon />}
                      onClick={() => handleUpdate(cap.id)}
                      isLoading={loading}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<CloseIcon />}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Flex justify="space-between" align="center">
                  <Box flex={1}>
                    <Text fontWeight="semibold">{cap.capability}</Text>
                    {cap.description && (
                      <Text fontSize="sm" color="gray.600">
                        {cap.description}
                      </Text>
                    )}
                  </Box>
                  <HStack>
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      aria-label="Edit capability"
                      onClick={() => startEdit(cap)}
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      aria-label="Delete capability"
                      colorScheme="red"
                      onClick={() => handleDelete(cap.id)}
                      isLoading={loading}
                    />
                  </HStack>
                </Flex>
              )}
            </ListItem>
          ))}
        </List>

        {capabilities.length === 0 && (
          <Text textAlign="center" color="gray.500" py={4}>
            No capabilities defined yet
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default AgentCapabilities;
