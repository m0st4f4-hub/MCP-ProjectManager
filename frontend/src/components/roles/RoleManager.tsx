'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { agentRolesApi } from '@/services/api/agent_roles';
import type {
  AgentRole,
  AgentRoleCreateData,
  AgentRoleUpdateData,
} from '@/types/agent_role';
import AddRoleModal from '@/components/role/AddRoleModal';
import EditRoleModal from '@/components/role/EditRoleModal';

const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<AgentRole[] | null>(null);
  const [selectedRole, setSelectedRole] = useState<AgentRole | null>(null);
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

  const fetchRoles = async () => {
    try {
      const data = await agentRolesApi.list(false);
      setRoles(data);
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

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = async (data: AgentRoleCreateData) => {
    try {
      await agentRolesApi.create(data);
      await fetchRoles();
      toast({
        title: 'Role created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to create role',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async (id: string, data: AgentRoleUpdateData) => {
    try {
      await agentRolesApi.update(id, data);
      await fetchRoles();
      toast({
        title: 'Role updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to update role',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!roles) {
    return (
      <Flex justify="center" align="center" p="10" minH="300px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box p={4} maxW="600px" mx="auto">
      <Flex justify="space-between" mb={4} align="center">
        <Text fontSize="xl" fontWeight="bold">
          Agent Roles
        </Text>
        <Button leftIcon={<AddIcon />} onClick={onAddOpen} size="sm">
          Add Role
        </Button>
      </Flex>
      {roles.length === 0 ? (
        <Text>No roles found.</Text>
      ) : (
        <List spacing={3}>
          {roles.map((role) => (
            <ListItem key={role.id} borderWidth="1px" borderRadius="md" p={2}>
              <Flex justify="space-between" align="center">
                <Text>{role.display_name}</Text>
                <Button
                  size="sm"
                  leftIcon={<EditIcon />}
                  onClick={() => {
                    setSelectedRole(role);
                    onEditOpen();
                  }}
                >
                  Edit
                </Button>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
      <AddRoleModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSubmit={handleAdd}
      />
      <EditRoleModal
        isOpen={isEditOpen}
        onClose={() => {
          setSelectedRole(null);
          onEditClose();
        }}
        onSubmit={handleEdit}
        role={selectedRole}
      />
    </Box>
  );
};

export default RoleManager;
