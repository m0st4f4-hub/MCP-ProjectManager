'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  VStack,
  useToast,
} from '@chakra-ui/react';
import type { AgentRole, AgentRoleUpdateData } from '@/types/agent_role';

interface EditRoleFormProps {
  role: AgentRole;
  onClose: () => void;
  onSubmit: (id: string, data: AgentRoleUpdateData) => Promise<void>;
}

const EditRoleForm: React.FC<EditRoleFormProps> = ({
  role,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(role.name);
  const [displayName, setDisplayName] = useState(role.display_name);
  const [primaryPurpose, setPrimaryPurpose] = useState(role.primary_purpose);
  const [isActive, setIsActive] = useState(role.is_active);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setName(role.name);
    setDisplayName(role.display_name);
    setPrimaryPurpose(role.primary_purpose);
    setIsActive(role.is_active);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !displayName.trim()) {
      toast({
        title: 'Name and Display Name are required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(role.id, {
        name,
        display_name: displayName,
        primary_purpose: primaryPurpose,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      toast({
        title: 'Error updating role',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Display Name</FormLabel>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Primary Purpose</FormLabel>
          <Input
            value={primaryPurpose}
            onChange={(e) => setPrimaryPurpose(e.target.value)}
          />
        </FormControl>
        <Checkbox
          isChecked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        >
          Is Active
        </Checkbox>
        <Button
          type="submit"
          isLoading={loading}
          isDisabled={!name.trim() || !displayName.trim()}
        >
          Update Role
        </Button>
        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default EditRoleForm;
