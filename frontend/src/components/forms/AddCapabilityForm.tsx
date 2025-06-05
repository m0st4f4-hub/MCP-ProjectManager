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
import type { AgentCapabilityCreateData } from '@/types/agents';

interface AddCapabilityFormProps {
  onSubmit: (data: AgentCapabilityCreateData) => Promise<void>;
  onClose: () => void;
}

const AddCapabilityForm: React.FC<AddCapabilityFormProps> = ({
  onSubmit,
  onClose,
}) => {
  const [capability, setCapability] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capability.trim()) {
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
      await onSubmit({ capability, description, is_active: isActive });
      onClose();
    } catch (err) {
      toast({
        title: 'Error creating capability',
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
          <Input
            value={capability}
            onChange={(e) => setCapability(e.target.value)}
          />
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
        <Button
          type="submit"
          isLoading={loading}
          isDisabled={!capability.trim()}
        >
          Create Capability
        </Button>
        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default AddCapabilityForm;
