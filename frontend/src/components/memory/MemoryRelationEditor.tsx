"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { memoryApi } from "@/services/api";
import type { MemoryRelation } from "@/types/memory";

interface MemoryRelationEditorProps {
  relation: MemoryRelation;
  onUpdated?: (relation: MemoryRelation) => void;
}

const MemoryRelationEditor: React.FC<MemoryRelationEditorProps> = ({
  relation,
  onUpdated,
}) => {
  const toast = useToast();
  const [fromId, setFromId] = useState(String(relation.from_entity_id));
  const [toId, setToId] = useState(String(relation.to_entity_id));
  const [type, setType] = useState(relation.relation_type);
  const [metadata, setMetadata] = useState(
    JSON.stringify(relation.metadata || {}, null, 2),
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updated = await memoryApi.updateRelation(relation.id, {
        from_entity_id: Number(fromId),
        to_entity_id: Number(toId),
        relation_type: type,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      });
      toast({ title: "Relation updated", status: "success", duration: 3000, isClosable: true });
      onUpdated?.(updated);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Failed to update relation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="md" bg="bg.surface">
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
          <Textarea value={metadata} onChange={(e) => setMetadata(e.target.value)} rows={4} />
        </FormControl>
        <Button type="submit" colorScheme="blue" isLoading={isLoading}>
          Save
        </Button>
      </VStack>
    </Box>
  );
};

export default MemoryRelationEditor;
