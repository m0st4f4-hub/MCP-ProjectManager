'use client';

import React, { useState } from 'react';
import {
  HStack,
  IconButton,
  Button,
  Textarea,
  Box,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { memoryApi } from '@/services/api';
import type {
  MemoryObservation,
  MemoryObservationUpdateData,
} from '@/types/memory';

interface MemoryObservationEditorProps {
  observation: MemoryObservation;
  onUpdated?: (obs: MemoryObservation) => void;
  onDeleted?: (id: number) => void;
}

const MemoryObservationEditor: React.FC<MemoryObservationEditorProps> = ({
  observation,
  onUpdated,
  onDeleted,
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(observation.content);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await memoryApi.updateObservation(observation.id, {
        content,
      } as MemoryObservationUpdateData);
      toast({
        title: 'Observation updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      onUpdated?.(updated);
    } catch (err) {
      toast({
        title: 'Failed to update observation',
        description: err instanceof Error ? err.message : 'Error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await memoryApi.deleteObservation(observation.id);
      toast({
        title: 'Observation deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleted?.(observation.id);
    } catch (err) {
      toast({
        title: 'Failed to delete observation',
        description: err instanceof Error ? err.message : 'Error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <HStack align="start">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="sm"
        />
        <Button onClick={handleSave} isLoading={loading} size="sm">
          Save
        </Button>
        <Button
          onClick={() => {
            setContent(observation.content);
            setIsEditing(false);
          }}
          size="sm"
        >
          Cancel
        </Button>
      </HStack>
    );
  }

  return (
    <HStack>
      <Box flex="1">{observation.content}</Box>
      <IconButton
        aria-label="Edit observation"
        icon={<EditIcon />}
        size="sm"
        onClick={() => setIsEditing(true)}
      />
      <IconButton
        aria-label="Delete observation"
        icon={<DeleteIcon />}
        size="sm"
        onClick={handleDelete}
        isLoading={loading}
      />
    </HStack>
  );
};

export default MemoryObservationEditor;
