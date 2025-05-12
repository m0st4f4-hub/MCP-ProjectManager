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
    List,
    ListItem,
    Button,
    Spinner,
    Select,
    Flex,
    Divider,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    useBreakpointValue,
    useDisclosure,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskUpdateData, Project, Agent } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import AddTaskForm from './AddTaskForm';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';

type GroupByType = 'status' | 'project' | 'agent' | 'parent';

const TaskList: React.FC = () => {
    const tasks = useTaskStore(state => state.tasks);
    const projects = useProjectStore(state => state.projects);
    const agents = useAgentStore(state => state.agents);
    const loading = useTaskStore(state => state.loading);
    const error = useTaskStore(state => state.error);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const toggleTaskComplete = useTaskStore(state => state.toggleTaskComplete);
    const removeTask = useTaskStore(state => state.removeTask);
    const editTask = useTaskStore(state => state.editTask);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);
    const filters = useTaskStore(state => state.filters);
    const { updateTask, deleteTask, addTask } = useTaskStore();

    const [groupBy, setGroupBy] = useState<GroupByType>('status');
    const { isOpen: isAddTaskModalOpen, onOpen: onOpenAddTaskModal, onClose: onCloseAddTaskModal } = useDisclosure();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [parentTaskForNewTask, setParentTaskForNewTask] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const isMobile = useBreakpointValue({ base: true, md: false });

    useEffect(() => {
        console.log("Tasks from store in TaskList:", JSON.stringify(tasks, null, 2));
    }, [tasks]);

    useEffect(() => {
        fetchTasks();
        fetchProjectsAndAgents();
    }, [fetchTasks, fetchProjectsAndAgents]);

    useEffect(() => {
        // After the first successful load (tasks length > 0), set initial load to false
        if (isInitialLoad && tasks.length > 0) {
            setIsInitialLoad(false);
        }
    }, [tasks, isInitialLoad]);

    const handleOpenAddTaskModal = useCallback((parentId: string | null = null) => {
        setEditingTask(null);
        setParentTaskForNewTask(parentId);
        onOpenAddTaskModal();
    }, [onOpenAddTaskModal]);

    const handleOpenEditTaskModal = useCallback((task: Task) => {
        setEditingTask(task);
        setParentTaskForNewTask(null);
        onOpenAddTaskModal();
    }, [onOpenAddTaskModal]);

    const handleCloseAddTaskModal = useCallback(() => {
        onCloseAddTaskModal();
        setEditingTask(null);
        setParentTaskForNewTask(null);
    }, [onCloseAddTaskModal]);

    // Filter tasks based on global filters
    const filteredTasks = useMemo(() => {
        const currentFilters = useTaskStore.getState().filters;
        return tasks.filter(task => {
            if (currentFilters.projectId && task.project_id !== currentFilters.projectId) return false;
            if (currentFilters.agentId && task.agent_id !== currentFilters.agentId) return false;
            if (currentFilters.status && currentFilters.status !== 'all') {
                const isCompleted = task.completed;
                if (currentFilters.status === 'completed' && !isCompleted) return false;
                if (currentFilters.status === 'active' && isCompleted) return false;
            }
            if (currentFilters.search) {
                const searchTermLower = currentFilters.search.toLowerCase();
                const titleMatch = task.title?.toLowerCase().includes(searchTermLower);
                const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower);
                if (!titleMatch && !descriptionMatch) return false;
            }
            return true;
        });
    }, [tasks]);

    const groupedAndFilteredTasks = useMemo(() => {
        const topLevelTasks = filteredTasks.filter(task => !task.parent_task_id);

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
                        name: `All Tasks (${filteredTasks.filter(t => !t.parent_task_id).length})`,
                        tasks: filteredTasks.filter(t => !t.parent_task_id)
                    }
                ]
            };
        }

        return { type: 'status', groups: [] };

    }, [filteredTasks, projects, agents, groupBy]);

    if (loading && isInitialLoad) {
        return (
            <Container maxW="container.lg" p={4}>
                <Box 
                    bg="bg.elevated"
                    p={6} 
                    rounded="radius.xl"
                    shadow="shadow.lg"
                    borderWidth="1px" 
                    borderColor="border.base"
                    height="400px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <VStack spacing={6}>
                        <Spinner size="xl" color="icon.primary" />
                        <Text color="text.muted">Loading tasks...</Text>
                    </VStack>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxW="container.lg" p={4}>
                <Box 
                    bg="bg.elevated"
                    p={6} 
                    rounded="radius.xl"
                    shadow="shadow.lg"
                    borderWidth="1px" 
                    borderColor="border.base"
                    height="400px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <VStack spacing={6}>
                        <Icon as={AddIcon} w={12} h={12} color="status.error" />
                        <Heading size="md" color="status.error">Error Loading Tasks</Heading>
                        <Text color="text.muted">{error}</Text>
                    </VStack>
                </Box>
            </Container>
        );
    }

    if (groupedAndFilteredTasks.groups.every(group => group.tasks.length === 0) && !loading) {
        return (
            <Container maxW="container.lg" p={4}>
                <Box 
                    bg="bg.surface" 
                    p={6} 
                    rounded="radius.lg"
                    shadow="shadow.md"
                    borderWidth="1px"
                    borderColor="border.base"
                    textAlign="center"
                >
                    <Heading size="md" color="text.heading" mb={3}>No Tasks Found</Heading>
                    <Text color="text.secondary" mb={4}>
                        There are no tasks matching your current filters, or no tasks have been created yet.
                    </Text>
                    <Button
                        leftIcon={<AddIcon />}
                        bg="bg.button.accent"
                        color="text.button.accent"
                        _hover={{ bg: "bg.button.accent.hover" }}
                        onClick={() => handleOpenAddTaskModal()}
                        size="md"
                    >
                        Add Your First Task
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" p={4} >
            <Heading size="lg" mb={6} color="text.heading">
                Task Workboard
            </Heading>

            {/* Controls Section */}
            <Flex 
                mb={6} 
                justifyContent="space-between" 
                alignItems="center"
                bg="bg.surface"
                p={4}
                borderRadius="md"
            >
                <HStack spacing={4}>
                    <Text fontSize="sm" fontWeight="medium" color="text.secondary">Group by:</Text>
                    <Select 
                        size="sm" 
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                        w="150px"
                        bg="bg.input"
                        borderColor="border.input"
                        _hover={{ borderColor: 'border.input_hover' }}
                    >
                        <option value="status">Status</option>
                        <option value="project">Project</option>
                        <option value="agent">Agent</option>
                        <option value="parent">Parent Task</option>
                    </Select>
                </HStack>
                <Button 
                    leftIcon={<AddIcon />} 
                    bg="bg.button.primary" 
                    color="text.button.primary"
                    _hover={{ bg: 'brand.600' }}
                    size="sm"
                    onClick={() => handleOpenAddTaskModal()}
                >
                    Add Task
                </Button>
            </Flex>

            <Accordion allowMultiple defaultIndex={[0]}>
                {groupedAndFilteredTasks.groups.map((group) => (
                    <AccordionItem border="none" mb={4} key={group.id}>
                    <h2>
                        <AccordionButton 
                            _hover={{
                                bg: 'interaction.hover'
                            }}
                            borderRadius="md"
                        >
                            <Box flex="1" textAlign="left">
                                <Heading size="sm" color="text.primary">{group.name}</Heading>
                            </Box>
                            <AccordionIcon color="text.primary" />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4} pt={2} px={0}>
                            {group.tasks.length > 0 ? (
                                <VStack spacing={4} align="stretch">
                                    {group.tasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={toggleTaskComplete}
                                        onDelete={removeTask}
                                        onEdit={editTask}
                                        onAddSubtask={() => handleOpenAddTaskModal(task.id)}
                                    />
                                ))}
                                </VStack>
                        ) : (
                                <Text color="text.muted" p={4} textAlign="center">No tasks in this group.</Text>
                        )}
                    </AccordionPanel>
                </AccordionItem>
                ))}
            </Accordion>

            {isAddTaskModalOpen && (
                <Modal isOpen={isAddTaskModalOpen} onClose={handleCloseAddTaskModal} size={isMobile ? 'full' : 'xl'} isCentered={!isMobile}>
                    <ModalOverlay />
                    <ModalContent bg="bg.modal" color="text.primary" borderColor="border.base" borderWidth="1px">
                        <ModalHeader borderBottomWidth="1px" borderColor="border.base">
                            {editingTask ? 'Edit Task' : 'Add New Task'}
                        </ModalHeader>
                        <ModalCloseButton color="text.secondary" _hover={{ bg: "interaction.hover", color: "text.primary" }} />
                        <ModalBody py={6}>
                            <AddTaskForm 
                                initialParentId={parentTaskForNewTask}
                                onClose={handleCloseAddTaskModal} 
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
};

export default React.memo(TaskList);
