import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { Project, ProjectUpdateData } from '@/services/api';
import EditModalBase from './common/EditModalBase';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: (updatedProjectData: ProjectUpdateData) => Promise<void>;
  onProjectDeleted: (projectId: number) => Promise<void>;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [project, isOpen]);

  const handleSave = async () => {
    if (!project) return;
    setIsLoading(true);
    const updateData: ProjectUpdateData = { name, description };
    try {
      await onProjectUpdated(updateData);
      toast({
        title: 'Project updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update project:', error);
      const message = error instanceof Error ? error.message : 'Could not update the project.';
      toast({
        title: 'Update failed.',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await onProjectDeleted(project.id);
      toast({
        title: 'Project deleted.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error('Failed to delete project:', error);
      const message = error instanceof Error ? error.message : 'Could not delete the project.';
      toast({
        title: 'Deletion failed.',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <EditModalBase<Project>
      isOpen={isOpen}
      onClose={onClose}
      entityName="Project"
      entityData={project}
      entityDisplayField="name"
      onSave={handleSave}
      onDelete={handleDelete}
      isLoadingSave={isLoading}
      isLoadingDelete={isDeleting}
      size="lg"
    >
      <FormControl isRequired>
        <FormLabel color="text.secondary">Name</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project Name"
          bg="bg.default"
          borderColor="border.default"
          focusBorderColor="brand.primary"
        />
      </FormControl>

      <FormControl>
        <FormLabel color="text.secondary">Description</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project Description"
          bg="bg.default"
          borderColor="border.default"
          focusBorderColor="brand.primary"
        />
      </FormControl>
    </EditModalBase>
  );
};

export default EditProjectModal; 