'use client';

import React, { useState } from 'react';
import { Box, Text, List, ListItem, ListIcon, Heading, IconButton, useDisclosure, Spinner } from '@chakra-ui/react';
import { MdWork, MdEdit } from 'react-icons/md';
import { Project, ProjectUpdateData } from '@/services/api';
import EditProjectModal from './EditProjectModal';
import { useTaskStore } from '@/store/taskStore';

const ProjectList: React.FC = () => {
  const projects = useTaskStore((state) => state.projects);
  const loadingProjects = useTaskStore((state) => state.loadingProjects);
  const updateProjectAction = useTaskStore((state) => state.updateProjectAction);
  const deleteProjectAction = useTaskStore((state) => state.deleteProjectAction);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedProject(null);
    onClose();
  };

  const handleProjectUpdated = async (dataToUpdate: ProjectUpdateData) => {
    if (!selectedProject) {
      console.error("No project selected for update.");
      return;
    }
    try {
      await updateProjectAction(selectedProject.id, dataToUpdate);
    } catch (_error) {
      console.error("Update project action failed, error caught in ProjectList:", _error);
    }
  };

  const handleProjectDeleted = async (projectId: number) => {
    try {
      await deleteProjectAction(projectId);
    } catch (_error) {
      console.error("Delete failed in ProjectList, handled by store/modal.");
    }
  };

  if (loadingProjects) {
    return <Spinner />;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" borderColor="border.default" bg="bg.surface">
      <Heading size="md" mb={4} color="text.default">Projects</Heading>
      {projects.length === 0 && !loadingProjects ? (
        <Text color="text.secondary">No projects found.</Text>
      ) : (
        <List spacing={3}>
          {projects.map((project) => (
            <ListItem key={project.id} display="flex" justifyContent="space-between" alignItems="center" py={2} borderBottomWidth="1px" borderColor="border.default">
              <Box>
                <ListIcon as={MdWork} color="green.500" />
                <Text as="span" fontWeight="bold" color="text.default">{project.name}</Text>
                {project.description && <Text fontSize="sm" color="text.secondary">{project.description}</Text>}
              </Box>
              <IconButton
                aria-label="Edit project"
                icon={<MdEdit />}
                size="sm"
                variant="ghost"
                onClick={() => handleEditClick(project)}
                color="text.secondary"
              />
            </ListItem>
          ))}
        </List>
      )}

      <EditProjectModal
        isOpen={isOpen}
        onClose={handleModalClose}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
      />
    </Box>
  );
};

export default ProjectList; 