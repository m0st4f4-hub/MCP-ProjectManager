'use client';
import * as logger from '@/utils/logger';

import React, { useEffect, useState } from 'react';
import { Box, Button, Input, List, ListItem, useToast } from '@chakra-ui/react';
import { mcpApi, memoryApi } from '@/services/api';
import type { ProjectFileAssociation } from '@/services/api/projects';
import TaskPagination from '../task/TaskPagination';

interface ProjectFilesProps {
  projectId: string;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({ projectId }) => {
  const toast = useToast();
  const [files, setFiles] = useState<ProjectFileAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filePath, setFilePath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await mcpApi.projectFile.list(
        projectId,
        currentPage * itemsPerPage,
        itemsPerPage
      );
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch project files');
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId, currentPage]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath) return;
    setUploading(true);
    try {
      const entity = await memoryApi.ingestFile(filePath);
      await mcpApi.projectFile.add({
        project_id: projectId,
        file_id: String(entity.id),
      });
      setFilePath('');
      toast({
        title: 'File uploaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchFiles();
    } catch (err) {
      logger.error(err);
      toast({
        title: 'Upload failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (fileId: string) => {
    try {
      await mcpApi.projectFile.remove({
        project_id: projectId,
        file_id: fileId,
      });
      fetchFiles();
    } catch (err) {
      logger.error(err);
      toast({
        title: 'Remove failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box>
      <h3>Project Files</h3>
      {files.length === 0 ? (
        <p>No files associated.</p>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem
              key={file.file_id}
              display="flex"
              gap={2}
              alignItems="center"
            >
              <span>{file.file_id}</span>
              <Button size="xs" onClick={() => handleRemove(file.file_id)}>
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
      )}
      <form onSubmit={handleUpload} style={{ marginTop: '1rem' }}>
        <Input
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="/path/to/file.txt"
        />
        <Button type="submit" mt={2} isLoading={uploading}>
          Upload
        </Button>
      </form>
      <TaskPagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={files.length + currentPage * itemsPerPage}
        onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() =>
          setCurrentPage((p) => (files.length < itemsPerPage ? p : p + 1))
        }
      />
    </Box>
  );
};

export default ProjectFiles;
