"use client";

import React from "react";
import { Box, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import type { MemoryEntity } from "@/types/memory";
import { useListMemory } from "@/hooks/useMemory";

const MemoryViewer: React.FC = () => {
  const { entities, loading, error } = useListMemory({ skip: 0, limit: 20 });

  return (
    <Box>
      <Heading size="md" mb="4">
        Memory Viewer
      </Heading>
      {loading && <Spinner />}
      {error && (
        <Text color="textError" mb="2">
          {error}
        </Text>
      )}
      <VStack align="stretch" spacing={2}>
        {entities.map((e) => (
          <Box key={e.id} p="2" borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">{e.entity_type}</Text>
            <Text fontSize="sm">{e.content}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default MemoryViewer;
