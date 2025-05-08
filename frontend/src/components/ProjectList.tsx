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
    useToast
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Project } from '@/types';

const ProjectList: React.FC = () => {
    const projects = useProjectStore(state => state.projects);
    const loading = useProjectStore(state => state.loading);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const removeProject = useProjectStore(state => state.removeProject);
    const tasks = useTaskStore(state => state.tasks);
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

    if (!projects.length) {
        return (
            <Box textAlign="center" py={8} bg="gray.700" rounded="lg" shadow="lg" borderWidth="1px" borderColor="gray.600">
                <Text color="gray.300">No projects found</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            {projects.map(project => {
                const stats = getProjectStats(project.id);
                return (
                    <Box
                        key={project.id}
                        p={4}
                        bg="gray.700"
                        rounded="lg"
                        shadow="lg"
                        borderWidth="1px"
                        borderColor="gray.600"
                        _hover={{ shadow: "xl", borderColor: "blue.400", transform: "translateY(-1px)" }}
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
                            bg: "blue.400",
                            opacity: 0.7
                        }}
                    >
                        <HStack mb={2}>
                            <Text fontWeight="medium" fontSize="md" color="white">{project.name}</Text>
                            <Spacer />
                            <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Delete project"
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                color="gray.100"
                                _hover={{ bg: 'red.500', color: 'white' }}
                                onClick={() => handleDelete(project)}
                            />
                        </HStack>
                        {project.description && (
                            <Text color="gray.300" fontSize="sm" mb={2} noOfLines={2}>
                                {project.description}
                            </Text>
                        )}
                        <Progress
                            value={stats.progress}
                            size="sm"
                            colorScheme="blue"
                            rounded="full"
                            mb={2}
                            bg="gray.600"
                        />
                        <HStack spacing={2} mt={2}>
                            <Badge colorScheme="blue" variant="solid">
                                Tasks: {stats.totalTasks}
                            </Badge>
                            <Badge colorScheme="green" variant="solid">
                                Completed: {stats.completedTasks}
                            </Badge>
                            <Badge colorScheme={stats.progress === 100 ? "green" : "yellow"} variant="solid">
                                {Math.round(stats.progress)}%
                            </Badge>
                        </HStack>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default React.memo(ProjectList); 