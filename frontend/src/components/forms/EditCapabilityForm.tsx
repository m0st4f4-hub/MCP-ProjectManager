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
import type {
  AgentCapability,
  AgentCapabilityUpdateData,
} from '@/types/agents';

interface EditCapabilityFormProps {
  capability: AgentCapability;
  onClose: () => void;
  onSubmit: (id: string, data: AgentCapabilityUpdateData) => Promise<void>;
}

const EditCapabilityForm: React.FC<EditCapabilityFormProps> = ({
  capability,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(capability.capability);
  const [description, setDescription] = useState(capability.description || '');
  const [isActive, setIsActive] = useState(capability.is_active);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setName(capability.capability);
    setDescription(capability.description || '');
    setIsActive(capability.is_active);
  }, [capability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Capability name is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(capability.id, {
        capability: name,
        description,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      toast({
        title: 'Error updating capability',
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
          <FormLabel>Capability</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>
        <Checkbox
          isChecked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        >
          Is Active
        </Checkbox>
        <Button type="submit" isLoading={loading} isDisabled={!name.trim()}>
          Update Capability
        </Button>
        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default EditCapabilityForm;
