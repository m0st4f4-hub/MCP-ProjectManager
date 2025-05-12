// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TaskItem from './TaskItem';
import {
    Box,
    Text,
    Heading,
    VStack,
    Container,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    SimpleGrid,
    Spinner,
    Select,
    Flex,
    Divider,
    HStack,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskUpdateData, Project, Agent } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import AddTaskForm from './AddTaskForm';
import { useDisclosure } from '@chakra-ui/react';

type GroupByType = 'status' | 'project' | 'agent' | 'parent';

const TaskList: React.FC = () => {
    const tasks = useTaskStore(state => state.tasks);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const loading = useTaskStore(state => state.loading);
    const error = useTaskStore(state => state.error);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const toggleTaskComplete = useTaskStore(state => state.toggleTaskComplete);
    const removeTask = useTaskStore(state => state.removeTask);
    const editTask = useTaskStore(state => state.editTask);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);

    const [groupBy, setGroupBy] = useState<GroupByType>('status');
    const { isOpen: isAddTaskModalOpen, onOpen: onOpenAddTaskModal, onClose: onCloseAddTaskModal } = useDisclosure();
    const [initialParentIdForNewTask, setInitialParentIdForNewTask] = useState<string | null>(null);

    useEffect(() => {
        console.log("Tasks from store in TaskList:", JSON.stringify(tasks, null, 2));
    }, [tasks]);

    useEffect(() => {
        fetchTasks();
        fetchProjectsAndAgents();
    }, [fetchTasks, fetchProjectsAndAgents]);

    const handleToggle = useCallback((id: string, completed: boolean) => {
        toggleTaskComplete(id, completed);
    }, [toggleTaskComplete]);

    const handleDelete = useCallback((id: string) => {
        removeTask(id);
    }, [removeTask]);

    const handleEdit = useCallback((editedTask: Task) => {
        const updateData: TaskUpdateData = {
            title: editedTask.title,
            description: editedTask.description,
            completed: editedTask.completed,
            project_id: editedTask.project_id,
            agent_id: editedTask.agent_id,
            parent_task_id: editedTask.parent_task_id
        };
        editTask(editedTask.id, updateData);
    }, [editTask]);

    const handleOpenAddTaskModalForNewTopLevelTask = () => {
        setInitialParentIdForNewTask(null);
        onOpenAddTaskModal();
    };

    const handleOpenAddTaskModalForSubtask = useCallback((parentId: string) => {
        setInitialParentIdForNewTask(parentId);
        onOpenAddTaskModal();
    }, [onOpenAddTaskModal]);

    const groupedAndFilteredTasks = useMemo(() => {
    const topLevelTasks = tasks.filter(task => !task.parent_task_id);

        if (groupBy === 'status') {
            return {
                type: 'status',
                groups: [
                    {
                        id: 'active',
                        name: `Active Tasks (${topLevelTasks.filter(t => !t.completed).length})`,
                        tasks: topLevelTasks.filter(t => !t.completed)
                    },
                    {
                        id: 'completed',
                        name: `Completed Tasks (${topLevelTasks.filter(t => t.completed).length})`,
                        tasks: topLevelTasks.filter(t => t.completed)
                    }
                ]
            };
        }

        if (groupBy === 'project') {
            const tasksByProject: Record<string, Task[]> = {};
            const unassignedTasks: Task[] = [];
            topLevelTasks.forEach(task => {
                if (task.project_id) {
                    if (!tasksByProject[task.project_id]) {
                        tasksByProject[task.project_id] = [];
                    }
                    tasksByProject[task.project_id].push(task);
                } else {
                    unassignedTasks.push(task);
                }
            });

            const projectGroups = projects.map(project => ({
                id: project.id,
                name: `${formatDisplayName(project.name)} (${(tasksByProject[project.id] || []).length})`,
                tasks: tasksByProject[project.id] || []
            }));
            if (unassignedTasks.length > 0) {
                projectGroups.push({
                    id: 'unassigned_project',
                    name: `Unassigned to Project (${unassignedTasks.length})`,
                    tasks: unassignedTasks
                });
            }
            return { type: 'project', groups: projectGroups };
        }

        if (groupBy === 'agent') {
            const tasksByAgent: Record<string, Task[]> = {};
            const unassignedTasks: Task[] = [];
            topLevelTasks.forEach(task => {
                if (task.agent_id) {
                    if (!tasksByAgent[task.agent_id]) {
                        tasksByAgent[task.agent_id] = [];
                    }
                    tasksByAgent[task.agent_id].push(task);
                } else {
                    unassignedTasks.push(task);
                }
            });

            const agentGroups = agents.map(agent => ({
                id: agent.id,
                name: `${formatDisplayName(agent.name)} (${(tasksByAgent[agent.id] || []).length})`,
                tasks: tasksByAgent[agent.id] || []
            }));

            if (unassignedTasks.length > 0) {
                agentGroups.push({
                    id: 'unassigned_agent',
                    name: `Unassigned to Agent (${unassignedTasks.length})`,
                    tasks: unassignedTasks
                });
            }
            return { type: 'agent', groups: agentGroups };
        }
        
        if (groupBy === 'parent') {
             return {
                type: 'parent',
                groups: [
                    {
                        id: 'all_tasks',
                        name: `All Tasks (${tasks.filter(t => !t.parent_task_id).length})`,
                        tasks: tasks.filter(t => !t.parent_task_id)
                    }
                ]
            };
        }

        return { type: 'status', groups: [] };

    }, [tasks, projects, agents, groupBy]);

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

    if (error) {
        return (
            <Container maxW="container.lg" p={4}>
                <Box textAlign="center" py={12} px={6} bg="red.900" rounded="xl" shadow="lg" borderWidth="1px" borderColor="red.700">
                    <Text fontSize="xl" fontWeight="medium" color="white">Error loading tasks</Text>
                    <Text fontSize="sm" color="red.200" mt={2}>{error}</Text>
                </Box>
            </Container>
        );
    }

    if (!tasks.length && !loading) {
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
                <Flex justifyContent="space-between" alignItems="center" p={4} pb={2}>
                    <Heading size="md" color="whiteAlpha.900">Tasks</Heading>
                    <HStack spacing={4}>
                        <Select 
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                            bg="gray.700"
                            borderColor="gray.600"
                            color="white"
                            w="200px"
                            size="sm"
                                    rounded="md"
                                >
                            <option value="status">Group by Status</option>
                            <option value="project">Group by Project</option>
                            <option value="agent">Group by Agent</option>
                            <option value="parent">View All (Hierarchical)</option>
                        </Select>
                        <Button colorScheme="green" onClick={handleOpenAddTaskModalForNewTopLevelTask} size="sm">
                            Add New Task
                        </Button>
                    </HStack>
                </Flex>
                <Divider borderColor="gray.700" />

                {groupedAndFilteredTasks.groups.length > 0 ? (
                    <Accordion allowMultiple defaultIndex={groupedAndFilteredTasks.groups.map((_, i) => i)} w="full" key={groupBy}>
                        {groupedAndFilteredTasks.groups.map(group => (
                            <AccordionItem border="none" mb={4} key={group.id}>
                            <h2>
                                <AccordionButton 
                                    bg="gray.750" 
                                    _hover={{ bg: 'gray.700' }} 
                                    rounded="md"
                                    py={3}
                                    px={4}
                                >
                                    <Box flex={1} textAlign="left">
                                            <Heading size="sm" color="whiteAlpha.900">{group.name}</Heading>
                                    </Box>
                                    <AccordionIcon color="whiteAlpha.900" />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4} pt={2} px={0}>
                                    {group.tasks.length > 0 ? (
                                        <VStack spacing={4} align="stretch">
                                            {group.tasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggle={handleToggle}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                                    onAddSubtask={handleOpenAddTaskModalForSubtask}
                                            />
                                        ))}
                                        </VStack>
                                ) : (
                                        <Text color="gray.400" p={4} textAlign="center">No tasks in this group.</Text>
                                )}
                            </AccordionPanel>
                        </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                     <Text color="gray.400" p={4} textAlign="center">No tasks to display for the current grouping.</Text>
                )}
            </VStack>

            <Modal isOpen={isAddTaskModalOpen} onClose={onCloseAddTaskModal} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
                        {initialParentIdForNewTask ? 'Add New Sub-task' : 'Add New Task'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <AddTaskForm initialParentId={initialParentIdForNewTask} onClose={onCloseAddTaskModal} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default React.memo(TaskList);
