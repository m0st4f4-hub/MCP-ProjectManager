'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
  Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { memoryApi } from '@/services/api';
import type { MemoryEntity } from '@/types/memory';

const MemorySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const data = await memoryApi.searchGraph(query);
      setResults(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
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
    >
      <Input
        placeholder="Search memory"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        mb={2}
        data-testid="memory-search-input"
      />
      <Button
        type="submit"
        isLoading={loading}
        mb={4}
        data-testid="memory-search-button"
      >
        Search
      </Button>
      {error && (
        <Text color="textError" mb={2} data-testid="memory-search-error">
          {error}
        </Text>
      )}
      {loading && <Spinner />}
      <List spacing={2} mt={2} data-testid="memory-search-results">
        {results.map((entity) => (
          <ListItem key={entity.id}>
            <Link as={NextLink} href={`/memory/${entity.id}`} color="link">
              {entity.entity_type}: {entity.content}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MemorySearch;
