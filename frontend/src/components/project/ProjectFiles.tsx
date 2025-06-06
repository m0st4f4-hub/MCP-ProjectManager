'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  List,
  ListItem,
  Text,
  useToast,
  VStack,
  HStack,
  Spinner,
  Heading,
} from '@chakra-ui/react';
import {
  getProjectFiles,
  associateFileWithProject,
  disassociateFileFromProject,
  ProjectFileAssociation,
} from '@/services/api/projects';
import { memoryApi } from '@/services/api';
import * as logger from '@/utils/logger';

interface ProjectFilesProps {
  projectId: string;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({ projectId }) => {
  const toast = useToast();
  const [files, setFiles] = useState<ProjectFileAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filePath, setFilePath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjectFiles(projectId, 0, 100); // Fetching first 100, add pagination if needed
      setFiles(response.data);
    } catch (err) {
      const errorMessage = 'Failed to fetch project files.';
      setError(errorMessage);
      logger.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleAssociateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath.trim()) {
      toast({ title: 'File path cannot be empty.', status: 'warning', duration: 3000 });
      return;
    }
    setIsSubmitting(true);
    try {
      // Ingesting file via memoryApi to get an entity/file ID first
      const entity = await memoryApi.ingestFile(filePath);
      await associateFileWithProject(projectId, { file_id: entity.id });
      
      toast({ title: 'File associated successfully.', status: 'success', duration: 3000 });
      setFilePath('');
      fetchFiles(); // Refresh the list
    } catch (err) {
      const errorMsg = 'Failed to associate file.';
      toast({ title: errorMsg, description: err instanceof Error ? err.message : 'Unknown error', status: 'error', duration: 5000 });
      logger.error(errorMsg, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await disassociateFileFromProject(projectId, fileId);
      toast({ title: 'File association removed.', status: 'success', duration: 3000 });
      fetchFiles(); // Refresh the list
    } catch (err) {
      const errorMsg = 'Failed to remove file association.';
      toast({ title: errorMsg, description: err instanceof Error ? err.message : 'Unknown error', status: 'error', duration: 5000 });
      logger.error(errorMsg, err);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
      <Heading size="md" mb={4}>Associated Files</Heading>
      <VStack as="form" onSubmit={handleAssociateFile} spacing={4} mb={6} align="stretch">
        <HStack>
          <Input
            placeholder="Enter absolute file path to associate"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            data-testid="file-path-input"
          />
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting} data-testid="associate-file-button">
            Associate File
          </Button>
        </HStack>
      </VStack>

      {loading && <Spinner />}
      {error && <Text color="red.500">{error}</Text>}
      
      {!loading && !error && (
        <List spacing={3}>
          {files.length > 0 ? (
            files.map((file) => (
              <ListItem key={file.file_id} d="flex" justifyContent="space-between" alignItems="center">
                <Text fontFamily="monospace">{file.file_id}</Text> 
                <Button size="sm" colorScheme="red" onClick={() => handleRemoveFile(file.file_id)}>
                  Remove
                </Button>
              </ListItem>
            ))
          ) : (
            <Text>No files associated with this project yet.</Text>
          )}
        </List>
      )}
    </Box>
  );
};

export default ProjectFiles;
