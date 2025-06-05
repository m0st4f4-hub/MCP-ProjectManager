'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { memoryApi } from '@/services/api';
import type { MemoryObservation } from '@/types/memory';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updated = await memoryApi.updateObservation(observation.id, {
        content,
      });
      onUpdated?.(updated);
      toast({ title: 'Observation updated', status: 'success' });
      setIsEditing(false);
    } catch (err) {
      toast({ title: 'Failed to update', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await memoryApi.deleteObservation(observation.id);
      onDeleted?.(observation.id);
      toast({ title: 'Observation deleted', status: 'success' });
    } catch (err) {
      toast({ title: 'Failed to delete', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {isEditing ? (
        <VStack align="stretch">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <HStack>
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              colorScheme="blue"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setContent(observation.content);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </HStack>
        </VStack>
      ) : (
        <HStack justifyContent="space-between">
          <Box flex="1">{observation.content}</Box>
          <HStack>
            <IconButton
              aria-label="Edit observation"
              icon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              size="sm"
            />
            <IconButton
              aria-label="Delete observation"
              icon={<DeleteIcon />}
              onClick={handleDelete}
              isLoading={isLoading}
              size="sm"
            />
          </HStack>
        </HStack>
      )}
    </Box>
  );
};

export default MemoryObservationEditor;
