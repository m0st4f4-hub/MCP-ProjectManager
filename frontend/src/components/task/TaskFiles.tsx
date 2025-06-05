'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Input, List, ListItem, useToast } from '@chakra-ui/react';
import { memoryApi } from '@/services/api';
import {
  getFilesAssociatedWithTask,
  associateFileWithTask,
  disassociateFileFromTask,
} from '@/services/api/tasks';
import type { TaskFileAssociation } from '@/types/task';

interface TaskFilesProps {
  projectId: string;
  taskNumber: number;
}

const TaskFiles: React.FC<TaskFilesProps> = ({ projectId, taskNumber }) => {
  const toast = useToast();
  const [files, setFiles] = useState<TaskFileAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filePath, setFilePath] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await getFilesAssociatedWithTask(projectId, taskNumber);
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch task files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId, taskNumber]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath) return;
    setUploading(true);
    try {
      const entity = await memoryApi.ingestFile(filePath);
      await associateFileWithTask(projectId, taskNumber, {
        file_id: String(entity.id),
      });
      setFilePath('');
      toast({ title: 'File uploaded', status: 'success', duration: 3000, isClosable: true });
      fetchFiles();
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (fileId: string) => {
    try {
      await disassociateFileFromTask(projectId, taskNumber, fileId);
      fetchFiles();
    } catch (err) {
      console.error(err);
      toast({ title: 'Remove failed', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const entity = await memoryApi.getEntity(Number(fileId));
      const content = entity.content || '';
      const filename = (entity.metadata as any)?.filename || `file_${fileId}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({ title: 'Download failed', status: 'error', duration: 5000, isClosable: true });
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
      <h3>Task Files</h3>
      {files.length === 0 ? (
        <p>No files associated.</p>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem key={file.file_id} display="flex" gap={2} alignItems="center">
              <span>{file.file_id}</span>
              <Button size="xs" onClick={() => handleDownload(file.file_id)}>
                Download
              </Button>
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
    </Box>
  );
};

export default TaskFiles;

