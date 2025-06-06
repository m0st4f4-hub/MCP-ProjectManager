import React, { useEffect, useState } from 'react';
import { Box, Button, Input, List, ListItem, useToast } from '@chakra-ui/react';
import {
  getProjectFiles,
  associateFileWithProject,
  disassociateFileFromProject,
  type ProjectFileAssociation,
} from '@/services/api/projects';
import { memoryApi } from '@/services/api';

interface ProjectFileUploadProps {
  projectId: string;
}

const ProjectFileUpload: React.FC<ProjectFileUploadProps> = ({ projectId }) => {
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
      const data = await getProjectFiles(
        projectId,
        currentPage * itemsPerPage,
        itemsPerPage
      );
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch project files');
      console.error(err);
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
      await associateFileWithProject(projectId, {
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
      console.error(err);
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
      fetchFiles();
    } catch (err) {
      console.error(err);
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
    </Box>
  );
};

export default ProjectFileUpload;
