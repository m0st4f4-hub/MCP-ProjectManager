'use client';

import React, { useEffect, useState } from 'react';
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
  useDisclosure,
  useToast,
  Select,
  Checkbox,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { agentCapabilitiesApi } from '@/services/api/agent_capabilities';
import { agentRolesApi } from '@/services/api/agent_roles';
import type {
  AgentCapability,
  AgentCapabilityCreateData,
  AgentCapabilityUpdateData,
} from '@/types/agents';
import type { AgentRole } from '@/types/agent_role';
import AddCapabilityModal from '@/components/role/AddCapabilityModal';
import EditCapabilityModal from '@/components/role/EditCapabilityModal';

const CapabilityManager: React.FC = () => {
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [capabilities, setCapabilities] = useState<AgentCapability[] | null>(
    null
  );
  const [selectedCapability, setSelectedCapability] =
    useState<AgentCapability | null>(null);
  const toast = useToast();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const loadRoles = async () => {
    try {
      const data = await agentRolesApi.list(false);
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0].id);
      }
    } catch (err) {
      toast({
        title: 'Failed to load roles',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadCapabilities = async (roleId: string) => {
    try {
      const data = await agentCapabilitiesApi.list(roleId);
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
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadCapabilities(selectedRole);
    }
  }, [selectedRole]);

  const handleAdd = async (data: AgentCapabilityCreateData) => {
    if (!selectedRole) return;
    try {
      await agentCapabilitiesApi.create(selectedRole, data);
      await loadCapabilities(selectedRole);
      toast({
        title: 'Capability created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to create capability',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async (id: string, data: AgentCapabilityUpdateData) => {
    try {
      await agentCapabilitiesApi.update(id, data);
      if (selectedRole) await loadCapabilities(selectedRole);
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
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await agentCapabilitiesApi.delete(id);
      if (selectedRole) await loadCapabilities(selectedRole);
      toast({
        title: 'Capability deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to delete capability',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Flex mb={4} gap={2} align="center">
        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          maxW="250px"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.display_name}
            </option>
          ))}
        </Select>
        <Button
          leftIcon={<AddIcon />}
          onClick={onAddOpen}
          size="sm"
          isDisabled={!selectedRole}
        >
          Add Capability
        </Button>
      </Flex>
      {!capabilities ? (
        <Flex justify="center" align="center" minH="100px">
          <Spinner />
        </Flex>
      ) : capabilities.length === 0 ? (
        <Text>No capabilities found.</Text>
      ) : (
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Capability</Th>
                <Th>Description</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {capabilities.map((cap) => (
                <Tr key={cap.id}>
                  <Td>{cap.capability}</Td>
                  <Td>{cap.description || '-'}</Td>
                  <Td>{cap.is_active ? 'Yes' : 'No'}</Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      leftIcon={<EditIcon />}
                      onClick={() => {
                        setSelectedCapability(cap);
                        onEditOpen();
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      leftIcon={<DeleteIcon />}
                      onClick={() => handleDelete(cap.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <AddCapabilityModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSubmit={handleAdd}
      />
      <EditCapabilityModal
        isOpen={isEditOpen}
        onClose={() => {
          setSelectedCapability(null);
          onEditClose();
        }}
        onSubmit={handleEdit}
        capability={selectedCapability}
      />
    </Box>
  );
};

export default CapabilityManager;
