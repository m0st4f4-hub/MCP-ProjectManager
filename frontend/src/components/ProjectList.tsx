'use client';

import React, { useEffect, useState } from 'react';
import {
    VStack,
    Box,
    Text,
    Progress,
    Badge,
    IconButton,
    HStack,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Flex,
    useBreakpointValue,
    Heading,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, AddIcon, CopyIcon, DownloadIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Project } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import { useDisclosure } from '@chakra-ui/react';

const ProjectList: React.FC = () => {
    const projects = useProjectStore(state => state.projects);
    const loading = useProjectStore(state => state.loading);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const removeProject = useProjectStore(state => state.removeProject);
    const archiveProject = useProjectStore(state => state.archiveProject);
    const unarchiveProject = useProjectStore(state => state.unarchiveProject);
    const projectFilters = useProjectStore(state => state.filters);
    const tasks = useTaskStore(state => state.tasks);
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const [cliPromptModalOpen, setCliPromptModalOpen] = useState(false);
    const [cliPromptText, setCliPromptText] = useState('');
    const [cliPromptProjectName, setCliPromptProjectName] = useState('');
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const cancelRef = React.useRef();

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
        } catch (error) {
            toast({
                title: 'Error deleting project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        setProjectToDelete(null);
        onAlertClose();
    };

    const handleArchiveProject = async (projectId: string) => {
        try {
            await archiveProject(projectId);
            toast({
                title: 'Project archived',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error archiving project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleUnarchiveProject = async (projectId: string) => {
        try {
            await unarchiveProject(projectId);
            toast({
                title: 'Project unarchived',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error unarchiving project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const filteredProjects = React.useMemo(() => {
        if (!projects) return [];
        return projects.filter(project => {
            if (!project) return false;
            const totalTasks = project.task_count ?? 0;
            const completedTasks = project.completed_task_count ?? 0;

            // Search Term Filter (Project Name and Description) - Uses projectFilters
            if (projectFilters.search) {
                const searchTermLower = projectFilters.search.toLowerCase();
                const nameMatch = project.name?.toLowerCase().includes(searchTermLower);
                const descriptionMatch = project.description?.toLowerCase().includes(searchTermLower);
                if (!nameMatch && !descriptionMatch) return false;
            }

            // Agent Filter (Projects the agent is working on) - Uses projectFilters.agentId
            // This now relies on ProjectFilters having agentId and API supporting it.
            if (projectFilters.agentId) { 
                const agentTasksInProject = tasks.filter(task => 
                    task.project_id === project.id && task.agent_id === projectFilters.agentId
                );
                if (agentTasksInProject.length === 0) return false;
            }

            // Status Filter (Based on project's task counts) - Uses projectFilters
            if (projectFilters.status && projectFilters.status !== 'all') {
                if (totalTasks === 0 && projectFilters.status === 'active') return false;
                if (totalTasks === 0 && projectFilters.status === 'completed') return true;

                const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
                if (projectFilters.status === 'completed' && !allCompleted) return false;
                if (projectFilters.status === 'active' && allCompleted) return false;
            }

            // Project ID filter from globalFilters doesn't make sense for filtering the project list itself,
            // unless it means to show only that specific project.
            if (projectFilters.projectId && project.id !== projectFilters.projectId) {
                // This would make the filter very restrictive, essentially singling out a project.
                // return false; // Uncomment if this specific behavior is desired.
            }

            return true;
        });
    }, [projects, projectFilters, tasks]);

    // Generate CLI prompt for a project
    const handleOpenCliPrompt = (project) => {
        const projectTasks = tasks.filter(task => task.project_id === project.id);
        const totalTasksInProject = projectTasks.length;
        const completedTasksInProject = projectTasks.filter(task => task.completed).length;
        const isInProgress = totalTasksInProject > 0 && completedTasksInProject < totalTasksInProject;
        const isCompleted = totalTasksInProject > 0 && completedTasksInProject === totalTasksInProject;
        const projectStatus = isCompleted ? 'Completed' : (isInProgress ? 'In Progress' : (totalTasksInProject > 0 ? 'Pending Start' : 'Idle (No Tasks)'));

        let prompt = `# MCP Project Review & Action Prompt
# Target Agent: @ProjectManager.mdc (or an appropriate coordinating agent)
# Goal: Review status, manage unassigned/pending tasks, and ensure progression for project '${project.name}'.

## Project Context
Project Name: ${project.name}
Project ID: ${project.id}
Description: ${project.description || 'No description provided.'}
Status: ${projectStatus}
Total Tasks: ${totalTasksInProject}
Completed Tasks: ${completedTasksInProject}
Pending Tasks: ${totalTasksInProject - completedTasksInProject}

---
## Tasks Overview & Suggested Actions
`;

        if (projectTasks.length === 0) {
            prompt += '\nNo tasks currently associated with this project.\n';
            prompt += "\nSuggested Action: Consider defining initial tasks using mcp_project-manager_create_task."
            prompt += `\nExample: mcp_project-manager_create_task(project_id='${project.id}', title='New Initial Task', description='Define sub-goals and assign agents.')`;
        } else {
            projectTasks.forEach((task, idx) => {
                const agentDisplay = task.agent_name ? `@${task.agent_name}` : (task.agent_id ? `AgentID: ${task.agent_id}` : 'UNASSIGNED');
                const taskStatus = task.completed ? 'Completed' : (task.status || 'To Do');
                prompt += `\n### Task ${idx + 1}: ${task.title} (ID: ${task.id})
  Status: ${taskStatus}
  Assigned Agent: ${agentDisplay}
  Description: ${task.description || 'No description.'}
`;
                if (!task.agent_id && !task.completed) {
                    prompt += `  Suggested Action: Assign an agent. Example: mcp_project-manager_update_task_by_id(task_id='${task.id}', agent_name='TARGET_AGENT_NAME')\n`;
                } else if (!task.completed) {
                    prompt += `  Suggested Action: Monitor progress. If blocked, investigate. Current agent: ${agentDisplay}.\n`;
                } else {
                    prompt += `  Status: Completed. No immediate action required for this task through this prompt.\n`;
                }
            });
        }

        prompt += `
---
## General MCP Commands for Project Management:
- List all tasks for this project: mcp_project-manager_get_tasks(project_id='${project.id}')
- Get specific task details: mcp_project-manager_get_task_by_id(task_id='TASK_ID_HERE')
- Update a task (e.g., assign agent, change status): mcp_project-manager_update_task_by_id(task_id='TASK_ID_HERE', ...)
- Create a new task for this project: mcp_project-manager_create_task(project_id='${project.id}', title='...', ...)

# Note: Replace TARGET_AGENT_NAME and TASK_ID_HERE with actual values.
# This prompt is intended for review and to guide manual MCP command execution or further agent tasking.
`;
        setCliPromptText(prompt);
        setCliPromptProjectName(project.name);
        setCliPromptModalOpen(true);
    };

    const handleCopyPrompt = async () => {
        if (cliPromptText) {
            try {
                await navigator.clipboard.writeText(cliPromptText);
                toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
            } catch {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            }
        }
    };

    if (loading) {
        return (
            <VStack spacing={4} align="stretch">
                {[1, 2, 3].map(i => (
                    <Box key={i} p={4} bg="bg.card" rounded="lg" shadow="md" borderWidth="1px" borderColor="border.primary">
                        <Box height="20px" width="60%" bg="bg.subtle" rounded="md" mb={2} />
                        <Box height="8px" bg="bg.subtle" rounded="full" />
                    </Box>
                ))}
            </VStack>
        );
    }

    if (!filteredProjects.length && !loading) {
        return (
            <Box textAlign="center" py={8} bg="bg.content" rounded="lg" shadow="md" borderWidth="1px" borderColor="border.primary">
                <Text color="text.secondary">No projects found</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" mb={4} px={1}>
                <Heading size="md" color="text.heading">Portfolio</Heading>
                {isMobile ? (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label='Project Actions'
                            icon={<HamburgerIcon />}
                            size="sm"
                            variant="ghost"
                            color="icon.secondary"
                            _hover={{ bg: "bg.hover.nav", color: "text.primary" }}
                        />
                        <MenuList bg="bg.card" borderColor="border.secondary">
                            <MenuItem 
                                icon={<AddIcon />} 
                                bg="bg.card" 
                                _hover={{ bg: "bg.hover.nav" }}
                            >
                                Add Project
                            </MenuItem>
                        </MenuList>
                    </Menu>
                ) : (
                    <Button 
                        leftIcon={<AddIcon />} 
                        size="sm" 
                        variant="outline" 
                        color="text.link"
                        borderColor="border.primary"
                        _hover={{ bg: "bg.hover.nav" }}
                    >
                        Add Project
                    </Button>
                )}
            </Flex>
            {filteredProjects.map(project => {
                // Calculate task counts from the tasks in the store
                const projectTasks = tasks.filter(task => task.project_id === project.id);
                const totalTasks = projectTasks.length;
                const completedTasks = projectTasks.filter(task => task.completed).length;

                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                const isCompleted = progress === 100 && totalTasks > 0;
                const isInProgress = totalTasks > 0 && !isCompleted;

                return (
                    <Box
                        key={project.id}
                        p={4}
                        bg="bg.card"
                        rounded="lg"
                        shadow="md"
                        borderWidth="1px"
                        borderColor="border.primary"
                        _hover={{
                            shadow: "lg",
                            borderColor: isInProgress ? 'accent.active' : (isCompleted ? 'border.subtle' : 'border.primary'),
                            transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s ease-in-out"
                        position="relative"
                        overflow="hidden"
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            bg: isInProgress ? 'accent.active' : "transparent",
                            opacity: 0.9
                        }}
                    >
                        <HStack 
                            mb={2} 
                            align={{ base: 'flex-start', md: 'start' }}
                            direction={{ base: 'column', md: 'row' }}
                        >
                            <VStack align="start" spacing={0.5} flex={1} mb={{ base: 2, md: 0 }}>
                                <Text 
                                    fontWeight="semibold"
                                    fontSize="lg"
                                    color="text.primary"
                                >
                                    {formatDisplayName(project.name)}
                                </Text>
                                <HStack>
                                    <Text fontSize="xs" color="text.secondary" fontWeight="medium">
                                        Tasks: {totalTasks}
                                    </Text>
                                    <Badge 
                                        variant="subtle"
                                        size="sm"
                                        px={2} 
                                        py={0.5} 
                                        borderRadius="md"
                                        bg={isCompleted ? 'badge.bg.success' : (isInProgress ? 'badge.bg.info' : 'badge.bg.neutral')} 
                                        color={isCompleted ? 'badge.text.success' : (isInProgress ? 'badge.text.info' : 'badge.text.neutral')}
                                    >
                                        {isCompleted ? "Completed" : (isInProgress ? "In Progress" : "Idle")}
                                    </Badge>
                                    {project.is_archived && (
                                        <Badge colorScheme="purple" variant="solid" ml={2} size="sm" px={2} py={0.5} borderRadius="md">
                                            Archived
                                        </Badge>
                                    )}
                                </HStack>
                            </VStack>
                            <Menu placement="bottom-end">
                                <MenuButton
                                    as={IconButton}
                                    aria-label="Options"
                                    icon={<HamburgerIcon />}
                                    variant="ghost"
                                    color="icon.secondary"
                                    _hover={{ bg: "bg.hover.nav", color: "text.primary" }}
                                    size="sm"
                                />
                                <MenuList bg="bg.card" borderColor="border.secondary" color="text.primary">
                                    <MenuItem 
                                        icon={<CopyIcon />} 
                                        onClick={() => handleOpenCliPrompt(project)}
                                        bg="bg.card"
                                        _hover={{ bg: "bg.hover.nav" }}
                                        _focus={{ bg: "bg.hover.nav" }}
                                    >
                                        Project CLI Prompt
                                    </MenuItem>
                                    {!project.is_archived ? (
                                        <MenuItem 
                                            icon={<DownloadIcon />} 
                                            onClick={() => handleArchiveProject(project.id)}
                                            bg="bg.card"
                                            _hover={{ bg: "bg.hover.nav" }}
                                            _focus={{ bg: "bg.hover.nav" }}
                                        >
                                            Archive Project
                                        </MenuItem>
                                    ) : (
                                        <MenuItem 
                                            icon={<RepeatClockIcon />} 
                                            onClick={() => handleUnarchiveProject(project.id)}
                                            bg="bg.card"
                                            _hover={{ bg: "bg.hover.nav" }}
                                            _focus={{ bg: "bg.hover.nav" }}
                                        >
                                            Unarchive Project
                                        </MenuItem>
                                    )}
                                    <MenuItem 
                                        icon={<DeleteIcon />} 
                                        onClick={() => handleDeleteInitiate(project)}
                                        bg="bg.card"
                                        color="text.danger"
                                        _hover={{ bg: "bg.danger.hover", color: "text.danger.hover" }}
                                        _focus={{ bg: "bg.danger.hover", color: "text.danger.hover" }}
                                    >
                                        Delete Project
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                        {project.description && (
                            <Text 
                                color="text.secondary" 
                                fontSize="sm"
                                fontWeight="normal"
                                mb={2} 
                                noOfLines={2}
                                maxWidth="80ch"
                            >
                                {project.description}
                            </Text>
                        )}
                        <Progress
                            value={progress}
                            size="xs"
                            hasStripe={isInProgress}
                            isAnimated={isInProgress}
                            mt={3}
                            borderRadius="full"
                            bg="progress.track.bg"
                            sx={{
                                "& > div[role=progressbar]": {
                                    bg: "progress.filledTrack.bg"
                                }
                            }}
                        />
                        <Flex justify="space-between" mt={2}>
                            <Text fontSize="xs" color="text.secondary">
                                {completedTasks} / {totalTasks} tasks
                            </Text>
                        </Flex>
                    </Box>
                );
            })}
            {/* CLI Prompt Modal */}
            <Modal isOpen={cliPromptModalOpen} onClose={() => setCliPromptModalOpen(false)} size="lg" isCentered>
                <ModalOverlay />
                <ModalContent bg="bg.card" color="text.primary" borderWidth="1px" borderColor="border.secondary">
                    <ModalHeader borderBottomWidth="1px" borderColor="border.secondary">
                        Project CLI Prompt{cliPromptProjectName ? `: ${cliPromptProjectName}` : ''}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <Box 
                            as="pre" 
                            whiteSpace="pre-wrap" 
                            fontSize="sm" 
                            p={4} 
                            bg="bg.subtle" 
                            color="text.secondary" 
                            borderRadius="md" 
                            borderWidth="1px"
                            borderColor="border.subtle"
                            maxH="60vh" 
                            overflowY="auto"
                        >
                            {cliPromptText}
                        </Box>
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px" borderColor="border.secondary">
                        <Button 
                            leftIcon={<CopyIcon />} 
                            onClick={handleCopyPrompt} 
                            variant="solid"
                            bg="button.primary.default"
                            color="button.primary.text"
                            _hover={{ bg: "button.primary.hover" }}
                            mr={3}
                        >
                            Copy to Clipboard
                        </Button>
                        <Button 
                            onClick={() => setCliPromptModalOpen(false)} 
                            variant="ghost"
                            color="text.link"
                            _hover={{ bg: "bg.hover.subtle" }}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* AlertDialog for Delete Confirmation */}
            {projectToDelete && (
                <AlertDialog
                    isOpen={isAlertOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onAlertClose}
                    isCentered
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent bg="bg.card" color="text.primary" borderWidth="1px" borderColor="border.secondary">
                            <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" borderColor="border.secondary">
                                Delete Project
                            </AlertDialogHeader>

                            <AlertDialogBody py={6}>
                                {projectToDelete.is_archived 
                                    ? "Are you sure you want to permanently delete this archived project? This action cannot be undone."
                                    : "Are you sure you want to delete this project? All associated tasks will also be deleted."
                                }
                            </AlertDialogBody>

                            <AlertDialogFooter borderTopWidth="1px" borderColor="border.secondary">
                                <Button ref={cancelRef} onClick={onAlertClose} variant="ghost" color="text.link" _hover={{ bg: "bg.hover.subtle" }}>
                                    Cancel
                                </Button>
                                <Button 
                                    colorScheme="red" 
                                    onClick={handleDeleteConfirm} 
                                    ml={3}
                                    bg="button.danger.default"
                                    color="button.danger.text"
                                    _hover={{ bg: "button.danger.hover" }}
                                >
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}
        </VStack>
    );
};

export default ProjectList; 