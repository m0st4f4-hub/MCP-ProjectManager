'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Spinner, Text, Button, VStack } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { memoryApi } from '@/services/api';
import type {
  MemoryMetadataResponse,
  MemoryContentResponse,
} from '@/types/memory';

const MemoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const contentResp: MemoryContentResponse =
          await memoryApi.getFileContent(Number(id));
        const metadataResp: MemoryMetadataResponse =
          await memoryApi.getFileMetadata(Number(id));
        setContent(contentResp.content);
        setMetadata(metadataResp.metadata);
      } catch (err) {
        setError('Failed to load memory entity');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memory-${id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p="4">
      <Heading size="md" mb="4">
        Memory {id}
      </Heading>
      <VStack align="start" spacing={4}>
        <Text whiteSpace="pre-wrap">{content}</Text>
        {metadata && (
          <Box width="full">
            <Heading size="sm" mb="2">
              Metadata
            </Heading>
            <pre data-testid="metadata">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </Box>
        )}
        <Button colorScheme="blue" onClick={handleDownload}>
          Download
        </Button>
      </VStack>
    </Box>
  );
};

export default MemoryDetailPage;
