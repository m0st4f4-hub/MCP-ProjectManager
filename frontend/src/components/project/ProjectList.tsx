"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  VStack,
  SimpleGrid,
  Button,
  Spinner,
  useToast,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { useProjectStore, ProjectState } from '@/store/projectStore';
import { useTaskStore, TaskState } from '@/store/taskStore';
import {
  Project,
  ProjectWithMeta,
  Task,
  TaskWithMeta,
  ProjectUpdateData,
  TaskStatus,
} from '@/types';
import CreateProjectModal from '../dashboard/CreateProjectModal';
import EditProjectModal from '../modals/EditProjectModal';
import AppIcon from '../common/AppIcon';
import ProjectCard from './ProjectCard';
import CliPromptModal from './CliPromptModal';
import DeleteProjectDialog from './DeleteProjectDialog';

const ProjectList: React.FC = () => {
  const projectsFromStore = useProjectStore((state: ProjectState) => state.projects);
  const loading = useProjectStore((state: ProjectState) => state.loading);
  const error = useProjectStore((state: ProjectState) => state.error);
  const fetchProjects = useProjectStore((state: ProjectState) => state.fetchProjects);
  const removeProject = useProjectStore((state: ProjectState) => state.removeProject);
  const archiveProject = useProjectStore((state: ProjectState) => state.archiveProject);
  const unarchiveProject = useProjectStore((state: ProjectState) => state.unarchiveProject);
  const editProject = useProjectStore((state: ProjectState) => state.editProject);
  const projectFilters = useProjectStore((state: ProjectState) => state.filters);
  const allTasksFromStore = useTaskStore((state: TaskState) => state.tasks);

  const toast = useToast();

  const [cliPromptModalOpen, setCliPromptModalOpen] = useState(false);
  const [cliPromptText, setCliPromptText] = useState('');
  const [cliPromptProjectName, setCliPromptProjectName] = useState('');
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [editingProject, setEditingProject] = useState<ProjectWithMeta | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteInitiate = (project: Project) => {
    setProjectToDelete(project);
    onAlertOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await removeProject(projectToDelete.id);
      toast({
        title: projectToDelete.is_archived ? 'Archived project permanently deleted' : 'Project deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error deleting project',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setProjectToDelete(null);
    onAlertClose();
  };

  const handleArchiveProject = async (id: string) => {
    try {
      await archiveProject(id);
      toast({ title: 'Project archived', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: 'Error archiving project', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleUnarchiveProject = async (id: string) => {
    try {
      await unarchiveProject(id);
      toast({ title: 'Project unarchived', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: 'Error unarchiving project', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleEditProject = (project: ProjectWithMeta) => {
    setEditingProject(project);
    onEditModalOpen();
  };

  const handleProjectUpdatedInModal = async (data: ProjectUpdateData) => {
    if (!editingProject) return;
    try {
      await editProject(editingProject.id, data);
      toast({ title: 'Project details updated', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: 'Error updating project', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000, isClosable: true });
      throw err;
    }
  };

  const handleProjectDeletedFromModal = async (id: string) => {
    try {
      await removeProject(id);
      toast({ title: 'Project deleted', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: 'Error deleting project', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 5000, isClosable: true });
      throw err;
    }
  };

  const handleCopyGetCommand = async (id: string) => {
    const command = `mcp project get --id ${id}`;
    try {
      await navigator.clipboard.writeText(command);
      toast({ title: "Project 'get' command copied!", description: command, status: 'success', duration: 2500, isClosable: true });
    } catch (err) {
      toast({ title: 'Failed to copy command', description: err instanceof Error ? err.message : String(err), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleOpenCliPrompt = (project: ProjectWithMeta) => {
    const projectTasks: TaskWithMeta[] = (project.tasks || []).map((task: Task) => ({ ...task, completed: task.status === TaskStatus.COMPLETED }));
    const totalTasks = projectTasks.length;
    const completed = projectTasks.filter((t) => t.completed).length;
    let prompt = `# MCP Project Review & Action Prompt\nProject Name: ${project.name}\nProject ID: ${project.id}`;
    prompt += `\nStatus: ${project.status}`;
    prompt += `\nTotal Tasks: ${totalTasks}\nCompleted Tasks: ${completed}`;
    setCliPromptText(prompt);
    setCliPromptProjectName(project.name);
    setCliPromptModalOpen(true);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(cliPromptText);
      toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: 'Failed to copy prompt', description: err instanceof Error ? err.message : 'An error occurred', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const filteredProjects = useMemo(() => {
    if (!projectsFromStore) return [];
    return projectsFromStore.filter((project: Project) => {
      if (!project) return false;
      const totalTasks = project.task_count ?? 0;
      const completedTasks = project.completed_task_count ?? 0;
      const isProjectArchived = project.is_archived ?? false;

      if (projectFilters.search) {
        const searchTermLower = projectFilters.search.toLowerCase();
        const nameMatch = project.name?.toLowerCase().includes(searchTermLower);
        const descriptionMatch = project.description?.toLowerCase().includes(searchTermLower);
        if (!nameMatch && !descriptionMatch) return false;
      }

      if (projectFilters.agentId && allTasksFromStore) {
        const agentTasksInProject = allTasksFromStore.filter(
          (task: Task) => task.project_id === project.id && task.agent_id === projectFilters.agentId,
        );
        if (agentTasksInProject.length === 0) return false;
      }

      const filterStatus = projectFilters.status;
      const filterIsArchived = projectFilters.is_archived;
      if (filterStatus && filterStatus !== 'all') {
        if (filterStatus === 'active') {
          if (isProjectArchived || (totalTasks > 0 && completedTasks === totalTasks) || totalTasks === 0) return false;
        }
        if (filterStatus === 'completed') {
          if (isProjectArchived || !(totalTasks > 0 && completedTasks === totalTasks)) return false;
        }
        if (filterStatus === 'active' || filterStatus === 'completed') {
          if (isProjectArchived) return false;
        }
      }

      if (filterStatus === 'all') {
        if (filterIsArchived === true && !isProjectArchived) return false;
        if (filterIsArchived === false && isProjectArchived) return false;
      }

      if (projectFilters.projectId && project.id !== projectFilters.projectId) return false;
      return true;
    });
  }, [projectsFromStore, projectFilters, allTasksFromStore]);

  const projectsToDisplay: ProjectWithMeta[] = useMemo(() => {
    if (!filteredProjects) return [];
    return filteredProjects.map((p: Project) => {
      const completed = p.completed_task_count ?? 0;
      const total = p.task_count ?? 0;
      let status: ProjectWithMeta['status'] = 'not_started';
      if (total > 0) status = completed === total ? 'completed' : 'in_progress';
      const progress = total > 0 ? (completed / total) * 100 : 0;
      return { ...p, taskCount: total, completedTaskCount: completed, progress, status };
    });
  }, [filteredProjects]);

  if (loading && (!projectsToDisplay || projectsToDisplay.length === 0)) {
    return (
      <Flex justify="center" align="center" p="10" minH="300px">
        <Spinner size="xl" color="primary" thickness="4px" speed="0.65s" emptyColor="borderDecorative" />
        <Text ml="4" fontSize="lg" color="textSecondary">
          Loading projects...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <VStack
        spacing="4"
        p={{ base: '6', md: '10' }}
        bg="statusErrorBgSubtle"
        borderRadius="lg"
        borderWidth="DEFAULT"
        borderColor="statusErrorBorder"
        alignItems="center"
        minH="300px"
        justifyContent="center"
      >
        <WarningTwoIcon boxSize="40px" color="textStatusError" />
        <Heading size="md" color="textStatusError" display="flex" alignItems="center">
          <WarningTwoIcon boxSize={5} mr={2} />
          An error occurred while fetching projects.
        </Heading>
        <Text color="textStatusError" textAlign="center">
          {error}
        </Text>
        <Button
          variant="outline"
          leftIcon={<AppIcon name="repeatclock" boxSize={4} />}
          onClick={() => fetchProjects()}
          mt="2"
          borderColor="statusErrorBorder"
          color="textStatusError"
          _hover={{ bg: 'errorBgSubtle' }}
        >
          Retry
        </Button>
      </VStack>
    );
  }

  if (!projectsToDisplay || projectsToDisplay.length === 0) {
    return (
      <VStack
        spacing="3"
        p={{ base: '6', md: '10' }}
        textAlign="center"
        borderWidth="DEFAULT"
        borderStyle="dashed"
        borderColor="borderDecorative"
        borderRadius="lg"
        bg="bgCanvas"
        minH="300px"
        justifyContent="center"
      >
        <SearchIcon boxSize="32px" color="iconDefault" mb="1" />
        <Heading as="h3" size="md" color="textSecondary" fontWeight="medium" display="flex" alignItems="center">
          <SearchIcon boxSize={5} mr={2} />
          No Projects Found
        </Heading>
        <Text color="textSecondary" fontSize="base" maxW="md">
          {projectFilters.search || (projectFilters.status && projectFilters.status !== 'all') || projectFilters.agentId
            ? 'No projects match your current filters. Try adjusting them or create a new project.'
            : 'Get started by creating a new project.'}
        </Text>
        <Button
          leftIcon={<AddIcon boxSize={4} />}
          onClick={onCreateModalOpen}
          mt="3"
          bg="bgInteractive"
          color="textInverse"
          fontWeight="medium"
          _hover={{ bg: 'bgInteractiveHover' }}
          _active={{ bg: 'bgInteractiveActive' }}
          px="6"
          size="lg"
        >
          Create New Project
        </Button>
      </VStack>
    );
  }

  return (
    <Box bg="bgCanvas" p={{ base: '2', md: '4' }} borderRadius={{ base: 'none', md: 'lg' }}>
      <Flex justifyContent="space-between" alignItems="center" mb="4" px={{ base: '2', md: '0' }}>
        <Heading size={{ base: 'lg', md: 'xl' }} color="textPrimary" display="flex" alignItems="center">
          <AppIcon name="projects" boxSize={6} mr={2} />
          Projects{' '}
          <Text as="span" color="textSecondary" fontWeight="normal">
            ({projectsToDisplay.length})
          </Text>
        </Heading>
        <HStack spacing={{ base: '1', md: '2' }}>
          <Button
            leftIcon={<AddIcon boxSize={4} />}
            onClick={onCreateModalOpen}
            bg="bgInteractive"
            color="textInverse"
            fontWeight="medium"
            borderRadius="md"
            size={{ base: 'sm', md: 'md' }}
            _hover={{ bg: 'bgInteractiveHover' }}
            _active={{ bg: 'bgInteractiveActive' }}
          >
            New Project
          </Button>
        </HStack>
      </Flex>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={{ base: '3', md: '4' }}>
        {projectsToDisplay.map((p: ProjectWithMeta) =>
          p ? (
            <ProjectCard
              key={p.id}
              project={p}
              projectToDeleteId={projectToDelete?.id || null}
              onEdit={handleEditProject}
              onArchive={handleArchiveProject}
              onUnarchive={handleUnarchiveProject}
              onDelete={handleDeleteInitiate}
              onCopyGet={handleCopyGetCommand}
              onOpenCliPrompt={handleOpenCliPrompt}
            />
          ) : null,
        )}
      </SimpleGrid>
      <CliPromptModal
        isOpen={cliPromptModalOpen}
        prompt={cliPromptText}
        projectName={cliPromptProjectName}
        onCopy={handleCopyPrompt}
        onClose={() => setCliPromptModalOpen(false)}
      />
      <DeleteProjectDialog
        isOpen={isAlertOpen}
        project={projectToDelete}
        cancelRef={cancelRef}
        onClose={onAlertClose}
        onConfirm={handleDeleteConfirm}
      />
      {isCreateModalOpen && <CreateProjectModal isOpen={isCreateModalOpen} onClose={onCreateModalClose} />}
      {editingProject && isEditModalOpen && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            onEditModalClose();
            setEditingProject(null);
          }}
          project={editingProject}
          onProjectUpdated={handleProjectUpdatedInModal}
          onProjectDeleted={handleProjectDeletedFromModal}
        />
      )}
    </Box>
  );
};

export default ProjectList;
