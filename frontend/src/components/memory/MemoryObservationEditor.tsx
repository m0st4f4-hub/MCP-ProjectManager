'use client';

import React, { useState } from 'react';
import {
  Box,
  Text,
  IconButton,
  Textarea,
  HStack,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: MemoryObservationUpdateData = { content };
      const updated = await memoryApi.updateObservation(observation.id, data);
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
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={2}
      bg="bg.surface"
      data-testid="memory-observation-editor"
    >
      {isEditing ? (
        <>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            size="sm"
            mb={2}
          />
          <HStack justifyContent="flex-end">
            <IconButton
              aria-label="Save observation"
              icon={<CheckIcon />}
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
            />
            <IconButton
              aria-label="Cancel edit"
              icon={<CloseIcon />}
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setContent(observation.content);
              }}
            />
          </HStack>
        </>
      ) : (
        <Flex justify="space-between" align="flex-start">
          <Text>{observation.content}</Text>
          <HStack spacing={1} ml={2}>
            <IconButton
              aria-label="Edit observation"
              icon={<EditIcon />}
              size="xs"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            />
            <IconButton
              aria-label="Delete observation"
              icon={<DeleteIcon />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={handleDelete}
              isLoading={isDeleting}
            />
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

export default MemoryObservationEditor;
