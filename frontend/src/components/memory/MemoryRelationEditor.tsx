'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import type { MemoryRelation, MemoryRelationUpdateData } from '@/types/memory';

interface MemoryRelationEditorProps {
  relation: MemoryRelation | null;
  onUpdated?: (relation: MemoryRelation) => void;
}

const MemoryRelationEditor: React.FC<MemoryRelationEditorProps> = ({
  relation,
  onUpdated,
}) => {
  const toast = useToast();
  const [relationType, setRelationType] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (relation) {
      setRelationType(relation.relation_type);
      setMetadata(
        relation.metadata ? JSON.stringify(relation.metadata, null, 2) : ''
      );
    }
  }, [relation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relation) return;
    setLoading(true);
    try {
      const data: MemoryRelationUpdateData = {
        relation_type: relationType,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      };
      const updated = await memoryApi.updateRelation(relation.id, data);
      toast({
        title: 'Relation updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onUpdated?.(updated);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!relation) return null;

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="bg.surface"
    >
      <FormControl mb={2}>
        <FormLabel>From Entity ID</FormLabel>
        <Input value={relation.from_entity_id} isReadOnly />
      </FormControl>
      <FormControl mb={2}>
        <FormLabel>To Entity ID</FormLabel>
        <Input value={relation.to_entity_id} isReadOnly />
      </FormControl>
      <FormControl mb={2}>
        <FormLabel>Relation Type</FormLabel>
        <Input
          value={relationType}
          onChange={(e) => setRelationType(e.target.value)}
        />
      </FormControl>
      <FormControl mb={2}>
        <FormLabel>Metadata (JSON)</FormLabel>
        <Textarea
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder="{}"
        />
      </FormControl>
      <Button type="submit" colorScheme="blue" isLoading={loading}>
        Save
      </Button>
    </Box>
  );
};

export default MemoryRelationEditor;
