"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { memoryApi } from "@/services/api";
import type { MemoryEntity } from "@/types/memory";

const MemoryViewer: React.FC = () => {
  const [entities, setEntities] = useState<MemoryEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const resp = await memoryApi.listEntities({ skip: 0, limit: 20 });
        setEntities(resp.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, []);

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
