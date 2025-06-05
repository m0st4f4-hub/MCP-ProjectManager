'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import type {
  MemoryRelation,
  MemoryRelationCreateData,
  MemoryRelationUpdateData,
} from '@/types/memory';

interface MemoryRelationEditorProps {
  relation?: MemoryRelation;
  onSuccess?: (relation: MemoryRelation) => void;
  onDelete?: (relationId: number) => void;
}

const MemoryRelationEditor: React.FC<MemoryRelationEditorProps> = ({
  relation,
  onSuccess,
  onDelete,
}) => {
  const toast = useToast();
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [type, setType] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (relation) {
      setFromId(String(relation.from_entity_id));
      setToId(String(relation.to_entity_id));
      setType(relation.relation_type);
      setMetadata(
        relation.metadata ? JSON.stringify(relation.metadata, null, 2) : ''
      );
    }
  }, [relation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base = {
        from_entity_id: Number(fromId),
        to_entity_id: Number(toId),
        relation_type: type,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      };
      let saved: MemoryRelation;
      if (relation) {
        await memoryApi.updateRelation(
          relation.id,
          base as MemoryRelationUpdateData
        );
        saved = { ...relation, ...base } as MemoryRelation;
      } else {
        saved = await memoryApi.createRelation(
          base as MemoryRelationCreateData
        );
      }
      toast({
        title: 'Relation saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.(saved);
    } catch (err) {
      toast({
        title: 'Error saving relation',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!relation) return;
    setLoading(true);
    try {
      await memoryApi.deleteRelation(relation.id);
      toast({
        title: 'Relation deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDelete?.(relation.id);
    } catch (err) {
      toast({
        title: 'Error deleting relation',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="bg.surface"
    >
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>From Entity ID</FormLabel>
          <Input value={fromId} onChange={(e) => setFromId(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>To Entity ID</FormLabel>
          <Input value={toId} onChange={(e) => setToId(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Relation Type</FormLabel>
          <Input value={type} onChange={(e) => setType(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Metadata (JSON)</FormLabel>
          <Textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
        </FormControl>
        <HStack>
          {relation && (
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isLoading={loading}
              type="button"
            >
              Delete
            </Button>
          )}
          <Button type="submit" colorScheme="blue" isLoading={loading}>
            {relation ? 'Update' : 'Create'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default MemoryRelationEditor;
