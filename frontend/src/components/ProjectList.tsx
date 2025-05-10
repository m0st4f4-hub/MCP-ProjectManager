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
    Spacer,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, CheckCircleIcon, CopyIcon, StarIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Project, TaskFilters } from '@/types';
import { formatDisplayName } from '@/lib/utils';

const ACCENT_COLOR = "#dad2cc";
const COMPLETED_COLOR_SUBTLE = "gray.500"; // For completed items, less prominent than accent
const COMPLETED_TEXT_COLOR = "gray.400";

const ProjectList: React.FC = () => {
    const projects = useProjectStore(state => state.projects);
    const loading = useProjectStore(state => state.loading);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const removeProject = useProjectStore(state => state.removeProject);
    const tasks = useTaskStore(state => state.tasks);
    const globalFilters = useTaskStore(state => state.filters);
    const toast = useToast();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const getProjectStats = (projectId: number) => {
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

            // Search Term Filter (Project Name and Description)
            if (globalFilters.searchTerm) {
                const searchTermLower = globalFilters.searchTerm.toLowerCase();
                const nameMatch = project.name?.toLowerCase().includes(searchTermLower);
                const descriptionMatch = project.description?.toLowerCase().includes(searchTermLower);
                if (!nameMatch && !descriptionMatch) return false;
            }

            // Agent Filter (Projects the agent is working on)
            if (globalFilters.agentName) {
                const agentTasksInProject = tasks.filter(task => 
                    task.project_id === project.id && task.agent_name === globalFilters.agentName
                );
                if (agentTasksInProject.length === 0) return false;
            }

            // Status Filter (Based on project's tasks completion)
            if (globalFilters.status && globalFilters.status !== 'all') {
                const projectTasks = tasks.filter(task => task.project_id === project.id);
                if (projectTasks.length === 0 && globalFilters.status === 'active') return false; // No tasks, not active
                if (projectTasks.length === 0 && globalFilters.status === 'completed') return true; // No tasks, can be considered completed for filtering if desired or false

                const allCompleted = projectTasks.every(task => task.completed);
                if (globalFilters.status === 'completed' && !allCompleted) return false;
                if (globalFilters.status === 'active' && allCompleted && projectTasks.length > 0) return false;
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
                    <Box key={i} p={4} bg="gray.700" rounded="lg" shadow="lg" borderWidth="1px" borderColor="gray.600">
                        <Box height="20px" width="60%" bg="gray.600" rounded="md" mb={2} />
                        <Box height="8px" bg="gray.600" rounded="full" />
                    </Box>
                ))}
            </VStack>
        );
    }

    if (!filteredProjects.length && !loading) {
        return (
            <Box textAlign="center" py={8} bg="gray.700" rounded="lg" shadow="lg" borderWidth="1px" borderColor="gray.600">
                <Text color="gray.300">No projects found</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            {filteredProjects.map(project => {
                const stats = getProjectStats(project.id);
                const isCompleted = stats.progress === 100;
                const isInProgress = stats.totalTasks > 0 && !isCompleted;

                return (
                    <Box
                        key={project.id}
                        p={4}
                        bg="gray.700"
                        rounded="lg"
                        shadow="lg"
                        borderWidth="1px"
                        borderColor="gray.600"
                        _hover={{ 
                            shadow: "xl", 
                            borderColor: isInProgress ? ACCENT_COLOR : (isCompleted ? COMPLETED_COLOR_SUBTLE : "gray.500"), 
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
                            bg: isInProgress ? ACCENT_COLOR : "transparent",
                            opacity: 0.9
                        }}
                    >
                        <HStack mb={2} align="start">
                            <VStack align="start" spacing={0.5} flex={1}>
                                <Text 
                                    fontWeight="semibold"
                                    fontSize="lg"
                                    color="whiteAlpha.900"
                                >
                                    {formatDisplayName(project.name)}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color={isCompleted ? COMPLETED_TEXT_COLOR : (isInProgress ? ACCENT_COLOR : "gray.400")}
                                    fontWeight="medium"
                                >
                                    Status: {isCompleted ? "Completed" : (isInProgress ? "In Progress" : "Idle")}
                                </Text>
                            </VStack>
                            <Spacer />
                            <Menu placement="bottom-end">
                                <MenuButton
                                    as={IconButton}
                                    aria-label="Options"
                                    icon={<HamburgerIcon />}
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ bg: "gray.600", color: "white" }}
                                    size="sm"
                                />
                                <MenuList bg="gray.700" borderColor="gray.600">
                                    <MenuItem 
                                        icon={<DeleteIcon />} 
                                        onClick={() => handleDelete(project)}
                                        bg="gray.700"
                                        color="red.300"
                                        _hover={{ bg: "gray.600", color: "red.200" }}
                                    >
                                        Delete
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                        {project.description && (
                            <Text 
                                color="gray.300" 
                                fontSize="sm"
                                fontWeight="normal"
                                mb={2} 
                                noOfLines={2}
                            >
                                {project.description}
                            </Text>
                        )}
                        <Progress
                            value={stats.progress}
                            size="sm"
                            rounded="full"
                            mb={2}
                            bg="gray.600"
                            sx={{
                                '& > div:first-of-type': {
                                    bg: isCompleted ? COMPLETED_COLOR_SUBTLE : (isInProgress ? ACCENT_COLOR : "gray.500")
                                }
                            }}
                        />
                        <HStack spacing={4} mt={3} flexWrap="wrap">
                            <HStack spacing={1} align="center">
                                <CopyIcon color={ACCENT_COLOR} boxSize="14px" /> 
                                <Text fontSize="xs" color="gray.200">Tasks: {stats.totalTasks}</Text>
                            </HStack>
                            <HStack spacing={1} align="center">
                                <CheckCircleIcon color={stats.completedTasks > 0 ? ACCENT_COLOR : "gray.500"} boxSize="14px" />
                                <Text fontSize="xs" color="gray.200">Completed: {stats.completedTasks}</Text>
                            </HStack>
                            <HStack spacing={1} align="center">
                                <StarIcon color={isInProgress ? ACCENT_COLOR : (isCompleted ? COMPLETED_COLOR_SUBTLE : "gray.500")} boxSize="14px" /> 
                                <Text fontSize="xs" color="gray.200">Progress: {Math.round(stats.progress)}%</Text>
                            </HStack>
                        </HStack>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default React.memo(ProjectList); 