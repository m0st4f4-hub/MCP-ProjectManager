'use client';

import React, { useState } from 'react';
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
import type { AgentRoleCreateData } from '@/types/agent_role';

interface AddRoleFormProps {
  onSubmit: (data: AgentRoleCreateData) => Promise<void>;
  onClose: () => void;
}

const AddRoleForm: React.FC<AddRoleFormProps> = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [primaryPurpose, setPrimaryPurpose] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      await onSubmit({
        name,
        display_name: displayName,
        primary_purpose: primaryPurpose,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      toast({
        title: 'Error creating role',
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
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Unique role name"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Display Name</FormLabel>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Primary Purpose</FormLabel>
          <Input
            value={primaryPurpose}
            onChange={(e) => setPrimaryPurpose(e.target.value)}
            placeholder="Primary purpose"
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
          Create Role
        </Button>
        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default AddRoleForm;
