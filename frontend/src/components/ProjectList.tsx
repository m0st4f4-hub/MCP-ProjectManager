'use client';

import React, { useEffect } from 'react';
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
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, AddIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Project } from '@/types';
import { TaskFilters } from '@/types/task';
import { formatDisplayName } from '@/lib/utils';

const ProjectList: React.FC = () => {
    const projects = useProjectStore(state => state.projects);
    const loading = useProjectStore(state => state.loading);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const removeProject = useProjectStore(state => state.removeProject);
    const tasks = useTaskStore(state => state.tasks);
    const globalFilters: TaskFilters = useTaskStore(state => state.filters);
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const getProjectStats = (projectId: string) => {
        const projectTasks = tasks.filter(task => task.project_id === projectId);
        const completedTasks = projectTasks.filter(task => task.completed);
        const progress = projectTasks.length ? (completedTasks.length / projectTasks.length) * 100 : 0;
        return {
            totalTasks: projectTasks.length,
            completedTasks: completedTasks.length,
            progress
        };
    };

    const handleDelete = async (project: Project) => {
        try {
            await removeProject(project.id);
            toast({
                title: 'Project deleted',
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
    };

    const filteredProjects = React.useMemo(() => {
        if (!projects) return [];
        return projects.filter(project => {
            if (!project) return false;
            const totalTasks = project.task_count ?? 0;
            const completedTasks = project.completed_task_count ?? 0;

            // Search Term Filter (Project Name and Description)
            if (globalFilters.search) {
                const searchTermLower = globalFilters.search.toLowerCase();
                const nameMatch = project.name?.toLowerCase().includes(searchTermLower);
                const descriptionMatch = project.description?.toLowerCase().includes(searchTermLower);
                if (!nameMatch && !descriptionMatch) return false;
            }

            // Agent Filter (Projects the agent is working on)
            if (globalFilters.agentId) {
                const agentTasksInProject = tasks.filter(task => 
                    task.project_id === project.id && task.agent_id === globalFilters.agentId
                );
                if (agentTasksInProject.length === 0) return false;
            }

            // Status Filter (Based on project's task counts)
            if (globalFilters.status && globalFilters.status !== 'all') {
                if (totalTasks === 0 && globalFilters.status === 'active') return false; // No tasks, not active
                if (totalTasks === 0 && globalFilters.status === 'completed') return true; // No tasks, can be considered completed

                const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
                if (globalFilters.status === 'completed' && !allCompleted) return false;
                if (globalFilters.status === 'active' && allCompleted) return false;
            }

            // Project ID filter from globalFilters doesn't make sense for filtering the project list itself,
            // unless it means to show only that specific project.
            if (globalFilters.projectId && project.id !== globalFilters.projectId) {
                // This would make the filter very restrictive, essentially singling out a project.
                // return false; // Uncomment if this specific behavior is desired.
            }

            return true;
        });
    }, [projects, globalFilters, tasks]);

    if (loading) {
        return (
            <VStack spacing={4} align="stretch">
                {[1, 2, 3].map(i => (
                    <Box key={i} p={4} bg="bg.card" rounded="lg" shadow="md" borderWidth="1px" borderColor="border.secondary">
                        <Box height="20px" width="60%" bg="bg.subtle" rounded="md" mb={2} />
                        <Box height="8px" bg="bg.subtle" rounded="full" />
                    </Box>
                ))}
            </VStack>
        );
    }

    if (!filteredProjects.length && !loading) {
        return (
            <Box textAlign="center" py={8} bg="bg.content" rounded="lg" shadow="md" borderWidth="1px" borderColor="border.secondary">
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
                        borderColor="border.focus"
                        _hover={{ bg: 'brand.50', _dark: { bg: 'brand.900' } }}
                    >
                        Add Project
                    </Button>
                )}
            </Flex>
            {filteredProjects.map(project => {
                const totalTasks = project.task_count ?? 0;
                const completedTasks = project.completed_task_count ?? 0;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                const isCompleted = progress === 100 && totalTasks > 0;
                const isInProgress = totalTasks > 0 && !isCompleted;
                const isIdle = totalTasks === 0;

                return (
                    <Box
                        key={project.id}
                        p={4}
                        bg="bg.card"
                        rounded="lg"
                        shadow="md"
                        borderWidth="1px"
                        borderColor="border.secondary"
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
                                        bg={isCompleted ? 'bg.status.success.subtle' : (isInProgress ? 'bg.status.info.subtle' : 'bg.subtle')} 
                                        color={isCompleted ? 'text.status.success' : (isInProgress ? 'text.status.info' : 'text.secondary')}
                                    >
                                        {isCompleted ? "Completed" : (isInProgress ? "In Progress" : "Idle")}
                                    </Badge>
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
                                <MenuList bg="bg.card" borderColor="border.secondary">
                                    <MenuItem 
                                        icon={<DeleteIcon />} 
                                        onClick={() => handleDelete(project)}
                                        bg="bg.card"
                                        color="danger.text"
                                        _hover={{ bg: "danger.bgHover", color: "danger.text" }}
                                    >
                                        Delete
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
                            >
                                {project.description}
                            </Text>
                        )}
                        <Progress
                            value={progress}
                            size="xs"
                            colorScheme="brand"
                            rounded="full"
                            bg="bg.subtle"
                        />
                        <Flex justify="space-between" mt={2}>
                            <Text fontSize="xs" color="text.secondary">
                                {completedTasks} / {totalTasks} tasks
                            </Text>
                        </Flex>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default ProjectList; 