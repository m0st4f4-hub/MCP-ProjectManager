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
        <Container maxW="container.lg" p={4}>
            <VStack spacing={6} align="stretch" w="100%">
                {/* Filters Section */}
                <Accordion allowToggle defaultIndex={[0]}>
                    <AccordionItem 
                        border="none" 
                        bg="gray.800" 
                        rounded="xl" 
                        shadow="lg" 
                        borderWidth="1px" 
                        borderColor="gray.700"
                        mb={0}
                    >
                        <h2>
                            <AccordionButton 
                                py={4} 
                                _hover={{ bg: 'gray.700' }} 
                                roundedTop="xl"
                            >
                                <Box flex={1} textAlign="left">
                                    <Heading size="md" color="white">Filters & Sorting</Heading>
                                </Box>
                                <AccordionIcon color="gray.300" />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={6} px={6}>
                            <VStack spacing={6} align="stretch">
                                {/* Task Statistics */}
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <Box 
                                        p={4} 
                                        bg="gray.700" 
                                        rounded="lg" 
                                        borderWidth="1px" 
                                        borderColor="gray.600"
                                        textAlign="center"
                                    >
                                        <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={1}>Total Tasks</Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="white">{tasks.length}</Text>
                                    </Box>
                                    <Box 
                                        p={4} 
                                        bg="gray.700" 
                                        rounded="lg" 
                                        borderWidth="1px" 
                                        borderColor="gray.600"
                                        textAlign="center"
                                    >
                                        <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={1}>Active</Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="blue.300">{activeTasks.length}</Text>
                                    </Box>
                                    <Box 
                                        p={4} 
                                        bg="gray.700" 
                                        rounded="lg" 
                                        borderWidth="1px" 
                                        borderColor="gray.600"
                                        textAlign="center"
                                    >
                                        <Text fontSize="sm" fontWeight="medium" color="gray.300" mb={1}>Completed</Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="green.300">{completedTasks.length}</Text>
                                    </Box>
                                </SimpleGrid>
                                
                                <Divider borderColor="gray.600" />
                                
                                <Box>
                                    <Text fontSize="md" fontWeight="medium" color="gray.100">Filters</Text>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={3}>
                                        <FormControl>
                                            <FormLabel color="gray.100" fontSize="sm">Status</FormLabel>
                                            <Select
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                bg="gray.600"
                                                color="white"
                                                borderColor="gray.500"
                                                _hover={{ borderColor: "gray.400" }}
                                                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                            >
                                                <option value="all">All</option>
                                                <option value="completed">Completed</option>
                                                <option value="active">Active</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color="gray.100" fontSize="sm">Project</FormLabel>
                                            <Select
                                                value={filters.projectId || ''}
                                                onChange={(e) => handleFilterChange('projectId', e.target.value ? Number(e.target.value) : null)}
                                                bg="gray.600"
                                                color="white"
                                                borderColor="gray.500"
                                                _hover={{ borderColor: "gray.400" }}
                                                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                            >
                                                <option value="">All Projects</option>
                                                {projects.map(project => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color="gray.100" fontSize="sm">Agent</FormLabel>
                                            <Select
                                                value={filters.agentName || ''}
                                                onChange={(e) => handleFilterChange('agentName', e.target.value || null)}
                                                bg="gray.600"
                                                color="white"
                                                borderColor="gray.500"
                                                _hover={{ borderColor: "gray.400" }}
                                                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                            >
                                                <option value="">All Agents</option>
                                                {agents.map(agent => (
                                                    <option key={agent.id} value={agent.name}>
                                                        {agent.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Box>
                                    <Text fontSize="md" fontWeight="medium" color="gray.100">Sort Options</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={3}>
                                        <FormControl>
                                            <FormLabel color="gray.100" fontSize="sm">Sort By</FormLabel>
                                            <Select
                                                value={sortOptions.field}
                                                onChange={(e) => handleSortChange(e.target.value, sortOptions.direction)}
                                                bg="gray.600"
                                                color="white"
                                                borderColor="gray.500"
                                                _hover={{ borderColor: "gray.400" }}
                                                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                            >
                                                <option value="created_at">Created Date</option>
                                                <option value="title">Title</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color="gray.100" fontSize="sm">Sort Direction</FormLabel>
                                            <Select
                                                value={sortOptions.direction}
                                                onChange={(e) => handleSortChange(sortOptions.field, e.target.value)}
                                                bg="gray.600"
                                                color="white"
                                                borderColor="gray.500"
                                                _hover={{ borderColor: "gray.400" }}
                                                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                            >
                                                <option value="asc">Ascending</option>
                                                <option value="desc">Descending</option>
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                {/* Tasks List */}
                <Box>
                    {activeTasks.length > 0 && (
                        <Box mb={4}>
                            <Flex align="center" bg="gray.800" p={4} rounded="lg" mb={2} borderWidth="1px" borderColor="gray.700">
                                <Heading size="md" color="blue.300" flex={1}>Active Tasks</Heading>
                                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">{activeTasks.length}</Badge>
                            </Flex>
                            <VStack spacing={3} align="stretch">
                                {activeTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                    />
                                ))}
                            </VStack>
                        </Box>
                    )}

                    {completedTasks.length > 0 && (
                        <Box>
                            <Flex align="center" bg="gray.800" p={4} rounded="lg" mb={2} borderWidth="1px" borderColor="gray.700">
                                <Heading size="md" color="green.300" flex={1}>Completed Tasks</Heading>
                                <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">{completedTasks.length}</Badge>
                            </Flex>
                            <Accordion allowToggle>
                                <AccordionItem 
                                    border="none" 
                                    bg="gray.800" 
                                    rounded="lg" 
                                    borderWidth="1px" 
                                    borderColor="gray.700"
                                >
                                    <h2>
                                        <AccordionButton py={3} _hover={{ bg: 'gray.700' }}>
                                            <Box flex={1} textAlign="left">
                                                <Text color="gray.100">Show Completed Tasks</Text>
                                            </Box>
                                            <AccordionIcon color="gray.300" />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <VStack spacing={3} align="stretch">
                                            {completedTasks.map(task => (
                                                <TaskItem
                                                    key={task.id}
                                                    task={task}
                                                    onToggle={handleToggle}
                                                    onDelete={handleDelete}
                                                    onEdit={handleEdit}
                                                />
                                            ))}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </Box>
                    )}
                </Box>
            </VStack>
        </Container>
    );
};

export default React.memo(TaskList);
