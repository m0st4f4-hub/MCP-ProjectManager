// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
'use client';

import React, { useCallback, useEffect } from 'react';
import TaskItem from './TaskItem';
import LoadingSkeleton from './LoadingSkeleton';
import {
    Box,
    Text,
    Heading,
    VStack,
    Container,
    HStack,
    Select,
    FormControl,
    FormLabel,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Divider,
    SimpleGrid,
    Badge,
    Flex,
    Spinner
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskSortOptions, TaskFilters } from '@/types';

const TaskList: React.FC = () => {
    const tasks = useTaskStore(state => state.tasks);
    const loading = useTaskStore(state => state.loading);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const toggleTaskComplete = useTaskStore(state => state.toggleTaskComplete);
    const removeTask = useTaskStore(state => state.removeTask);
    const editTask = useTaskStore(state => state.editTask);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const sortOptions = useTaskStore(state => state.sortOptions);
    const filters = useTaskStore(state => state.filters);
    const setSortOptions = useTaskStore(state => state.setSortOptions);
    const setFilters = useTaskStore(state => state.setFilters);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);

    useEffect(() => {
        fetchTasks();
        fetchProjectsAndAgents();
    }, [fetchTasks, fetchProjectsAndAgents]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleToggle = useCallback((id: number) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            toggleTaskComplete(id, !task.completed);
        }
    }, [tasks, toggleTaskComplete]);

    const handleDelete = useCallback((id: number) => {
        removeTask(id);
    }, [removeTask]);

    const handleEdit = useCallback((editedTask: Task) => {
        editTask(editedTask.id, {
            title: editedTask.title,
            description: editedTask.description ?? undefined,
            completed: editedTask.completed,
            project_id: editedTask.project_id ?? undefined,
            agent_name: editedTask.agent_name ?? undefined
        });
    }, [editTask]);

    const handleSortChange = (field: string, direction: string) => {
        setSortOptions({
            field: field as TaskSortOptions['field'],
            direction: direction as TaskSortOptions['direction']
        });
    };

    const handleFilterChange = (field: keyof TaskFilters, value: string | number | null) => {
        setFilters({
            ...filters,
            [field]: field === 'projectId' ? (value ? Number(value) : null) : value
        });
    };

    // Count active and completed tasks
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    if (loading) {
        return (
            <Container maxW="container.lg" p={4}>
                <Box 
                    bg="gray.800" 
                    p={6} 
                    rounded="xl" 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderColor="gray.700"
                    height="400px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <VStack spacing={6}>
                        <Spinner size="xl" color="blue.400" thickness="4px" speed="0.65s" />
                        <Text color="gray.300">Loading tasks...</Text>
                    </VStack>
                </Box>
            </Container>
        );
    }

    if (!tasks.length) {
        return (
            <Container maxW="container.lg" p={4}>
                <Box 
                    textAlign="center" 
                    py={12} 
                    px={6}
                    bg="gray.800" 
                    rounded="xl" 
                    shadow="lg"
                    borderWidth="1px"
                    borderColor="gray.700"
                >
                    <Text fontSize="xl" fontWeight="medium" color="gray.100">No tasks found</Text>
                    <Text fontSize="sm" color="gray.400" mt={2}>Create a new task to get started</Text>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" p={0}>
            <VStack spacing={4} align="stretch" w="full">
                {tasks.length > 0 && (
                    <Accordion allowMultiple defaultIndex={[0]} w="full">
                        <AccordionItem border="none" mb={4}>
                            <h2>
                                <AccordionButton 
                                    bg="gray.750"
                                    _hover={{ bg: 'gray.700' }} 
                                    rounded="md"
                                    py={3}
                                    px={4}
                                >
                                    <Box flex={1} textAlign="left">
                                        <Heading size="sm" color="whiteAlpha.900">Active Tasks ({activeTasks.length})</Heading>
                                    </Box>
                                    <AccordionIcon color="whiteAlpha.900" />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4} pt={2} px={0}>
                                {activeTasks.length > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                        {activeTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggle={handleToggle}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <Text color="gray.400" p={4} textAlign="center">No active tasks.</Text>
                                )}
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem border="none">
                            <h2>
                                <AccordionButton 
                                    bg="gray.750" 
                                    _hover={{ bg: 'gray.700' }} 
                                    rounded="md"
                                    py={3}
                                    px={4}
                                >
                                    <Box flex={1} textAlign="left">
                                        <Heading size="sm" color="whiteAlpha.900">Completed Tasks ({completedTasks.length})</Heading>
                                    </Box>
                                    <AccordionIcon color="whiteAlpha.900" />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4} pt={2} px={0}>
                                {completedTasks.length > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                        {completedTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggle={handleToggle}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <Text color="gray.400" p={4} textAlign="center">No completed tasks.</Text>
                                )}
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                )}
            </VStack>
        </Container>
    );
};

export default React.memo(TaskList);
