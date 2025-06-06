'use client';
import * as logger from '@/utils/logger';

import React, { useEffect, useState } from 'react';
import { Box, Button, Input, List, ListItem, useToast } from '@chakra-ui/react';
<<<<<<< HEAD
import { mcpApi, memoryApi } from '@/services/api';
import { useIngestFile } from '@/hooks/useMemory';
<<<<<<< HEAD
=======
=======
import { memoryApi } from '@/services/api';
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
import {
  getProjectFiles,
  associateFileWithProject,
  disassociateFileFromProject,
} from '@/services/projects';
<<<<<<< HEAD
=======
>>>>>>> origin/codex/add-api-calls-in-projects.ts
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
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
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;
  const { ingestFile } = useIngestFile();

  const fetchFiles = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await getProjectFiles(
=======
      const data = await getProjectFiles(
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
        projectId,
        currentPage * itemsPerPage,
        itemsPerPage
      );
      setFiles(response.data);
      setTotal(response.total);
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
<<<<<<< HEAD
      const entity = await ingestFile(filePath);
<<<<<<< HEAD
      await associateFileWithProject(projectId, {
=======
      await mcpApi.projectFile.add({
        project_id: projectId,
=======
      const entity = await memoryApi.ingestFile(filePath);
      await associateFileWithProject(projectId, {
>>>>>>> origin/codex/add-api-calls-in-projects.ts
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
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
      await disassociateFileFromProject(projectId, fileId);
      toast({
        title: 'File removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
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
        totalItems={total}
        onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() =>
          setCurrentPage((p) =>
            Math.min(Math.ceil(total / itemsPerPage) - 1, p + 1)
          )
        }
      />
    </Box>
  );
};

export default ProjectFiles;
