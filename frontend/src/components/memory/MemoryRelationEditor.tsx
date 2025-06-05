'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import type { MemoryRelation } from '@/types/memory';

interface MemoryRelationEditorProps {
  relation: MemoryRelation;
  onUpdated?: (relation: MemoryRelation) => void;
}

const MemoryRelationEditor: React.FC<MemoryRelationEditorProps> = ({
  relation,
  onUpdated,
}) => {
  const toast = useToast();
  const [relationType, setRelationType] = useState(relation.relation_type);
  const [metadata, setMetadata] = useState(
    JSON.stringify(relation.metadata ?? {}, null, 2)
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await memoryApi.updateRelation(relation.id, {
        relation_type: relationType,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      });
      toast({ title: 'Relation updated', status: 'success', duration: 3000 });
      onUpdated?.(updated);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update',
        status: 'error',
        duration: 5000,
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
          <Input value={relation.from_entity_id} isReadOnly />
        </FormControl>
        <FormControl>
          <FormLabel>To Entity ID</FormLabel>
          <Input value={relation.to_entity_id} isReadOnly />
        </FormControl>
        <FormControl>
          <FormLabel>Relation Type</FormLabel>
          <Input
            value={relationType}
            onChange={(e) => setRelationType(e.target.value)}
            placeholder="related_to"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Metadata (JSON)</FormLabel>
          <Input
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder="{}"
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" isLoading={loading}>
          Save
        </Button>
      </VStack>
    </Box>
  );
};

export default MemoryRelationEditor;
