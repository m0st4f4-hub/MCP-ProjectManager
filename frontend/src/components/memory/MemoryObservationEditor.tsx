'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import type { MemoryObservation, MemoryObservationUpdateData } from '@/types/memory';

interface MemoryObservationEditorProps {
  observation: MemoryObservation;
  onUpdated?: (observation: MemoryObservation) => void;
  onDeleted?: () => void;
}

const MemoryObservationEditor: React.FC<MemoryObservationEditorProps> = ({
  observation,
  onUpdated,
  onDeleted,
}) => {
  const toast = useToast();
  const [content, setContent] = useState(observation.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const data: MemoryObservationUpdateData = { content };
    try {
      const updated = await memoryApi.updateObservation(observation.id, data);
      toast({ title: 'Observation updated', status: 'success', duration: 3000, isClosable: true });
      onUpdated?.(updated);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update observation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await memoryApi.deleteObservation(observation.id);
      toast({ title: 'Observation deleted', status: 'info', duration: 3000, isClosable: true });
      onDeleted?.();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Failed to delete observation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <FormControl>
        <FormLabel>Content</FormLabel>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
      </FormControl>
      <HStack mt={2} spacing={2}>
        <Button colorScheme="blue" onClick={handleSave} isLoading={isSaving}>
          Save
        </Button>
        <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
          Delete
        </Button>
      </HStack>
    </Box>
  );
};

export default MemoryObservationEditor;
