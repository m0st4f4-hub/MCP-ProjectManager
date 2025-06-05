'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { memoryApi } from '@/services/api';
import type { MemoryEntity } from '@/types/memory';

const MemorySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await memoryApi.searchGraph(query.trim());
      setResults(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSearch}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="bg.surface"
    >
      <FormControl mb={4}>
        <FormLabel>Search Memory</FormLabel>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search knowledge graph"
        />
      </FormControl>
      <Button type="submit" colorScheme="blue" isLoading={loading} mb={4}>
        Search
      </Button>
      {error && (
        <Text color="textError" mb={2}>
          {error}
        </Text>
      )}
      <List spacing={2}>
        {results.map((entity) => (
          <ListItem key={entity.id}>
            <Link href={`/memory/entities/${entity.id}`}>
              {entity.entity_type}: {entity.content}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MemorySearch;
