// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import TaskItem from './TaskItem'; // No longer directly used here
import {
    Container,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useBreakpointValue,
    useDisclosure,
    Box,
    Text,
    Button,
} from '@chakra-ui/react';
import { useTaskStore, sortTasks } from '@/store/taskStore';
import { Task } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import AddTaskForm from './AddTaskForm';
// Icons are no longer directly used by TaskList:
// import { AddIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';
import ListView from './ListView';
import TaskControls from './TaskControls';
import NoTasks from './NoTasks'; // Import the new component
import TaskLoading from './TaskLoading'; // Import the new component
import TaskError from './TaskError'; // Import the new component
import KanbanView from './KanbanView'; // Import KanbanView

type GroupByType = 'status' | 'project' | 'agent' | 'parent';
type ViewMode = 'list' | 'kanban';
// type StatusType = 'To Do' | 'In Progress' | 'Blocked' | 'Completed'; // For Kanban later
// type ColorMap = { // For Kanban later
//     [K in StatusType]: string;
// };

interface TaskGroup {
    id: string;
    name: string;
    tasks?: Task[];
    subgroups?: TaskSubgroup[];
    status?: string;
}

interface TaskSubgroup {
    id: string;
    name: string;
    tasks: Task[];
    status?: string;
}

interface GroupedTasks {
    type: GroupByType;
    groups: TaskGroup[];
}

const TaskList: React.FC = () => {
    const tasks = useTaskStore(state => state.tasks);
    const projects = useProjectStore(state => state.projects);
    const agents = useAgentStore(state => state.agents);
    const loading = useTaskStore(state => state.loading);
    const error = useTaskStore(state => state.error);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);
    const sortOptions = useTaskStore(state => state.sortOptions);
    const editTask = useTaskStore(state => state.editTask);
    const deleteTask = useTaskStore(state => state.deleteTask);

    const [groupBy, setGroupBy] = useState<GroupByType>('status');
    const { isOpen: isAddTaskModalOpen, onOpen: onOpenAddTaskModal, onClose: onCloseAddTaskModal } = useDisclosure();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [parentTaskForNewTask, setParentTaskForNewTask] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

    // const boardRef = useRef<HTMLDivElement>(null); // For Kanban later
    // const [isCompact, setIsCompact] = useState(false); // For Kanban later
    // const [brand500, statusInProgress, statusBlocked, statusCompleted, borderBase, bgSurface, bgCard] = useToken('colors', [
    //     'brand.500',
    //     'status.inprogress',
    //     'status.blocked',
    //     'status.success',
    //     'border.base',
    //     'bg.surface',
    //     'bg.card',
    // ]); // For Kanban later

    useEffect(() => {
        fetchTasks();
        fetchProjectsAndAgents();
    }, [fetchTasks, fetchProjectsAndAgents]);

    useEffect(() => {
        if (isInitialLoad && tasks.length > 0) {
            setIsInitialLoad(false);
        }
    }, [tasks, isInitialLoad]);

    // useEffect(() => { // For Kanban later
    //     const handleResize = () => {
    //         if (boardRef.current) {
    //             setIsCompact(boardRef.current.offsetWidth < 900);
    //         }
    //     };
    //     window.addEventListener('resize', handleResize);
    //     handleResize();
    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);

    const handleOpenAddTaskModalCallback = useCallback((taskToEdit: Task | null = null, parentId: string | null = null) => {
        setEditingTask(taskToEdit);
        setParentTaskForNewTask(parentId);
        onOpenAddTaskModal();
    }, [onOpenAddTaskModal, setEditingTask, setParentTaskForNewTask]);

    const handleCloseAddTaskModalCallback = useCallback(() => {
        onCloseAddTaskModal();
        setEditingTask(null);
        setParentTaskForNewTask(null);
    }, [onCloseAddTaskModal, setEditingTask, setParentTaskForNewTask]);

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

    const groupedAndFilteredTasks: GroupedTasks = useMemo(() => {
        const topLevelTasks = filteredTasks.filter(task => !task.parent_task_id);
        const getStatusSubgroups = (currentTasks: Task[]) => ([
            {
                id: 'active',
                name: `Active Tasks (${currentTasks.filter(t => !t.completed).length})`,
                tasks: sortTasks(currentTasks.filter(t => !t.completed), sortOptions),
                status: 'active',
            },
            {
                id: 'completed',
                name: `Completed Tasks (${currentTasks.filter(t => t.completed).length})`,
                tasks: sortTasks(currentTasks.filter(t => t.completed), sortOptions),
                status: 'completed',
            }
        ]);

        if (groupBy === 'status') {
            return {
                type: 'status',
                groups: getStatusSubgroups(topLevelTasks)
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
                subgroups: getStatusSubgroups(tasksByProject[project.id] || [])
            }));
            if (unassignedTasks.length > 0) {
                projectGroups.push({
                    id: 'unassigned_project',
                    name: `Unassigned to Project (${unassignedTasks.length})`,
                    subgroups: getStatusSubgroups(unassignedTasks)
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
                subgroups: getStatusSubgroups(tasksByAgent[agent.id] || [])
            }));
            if (unassignedTasks.length > 0) {
                agentGroups.push({
                    id: 'unassigned_agent',
                    name: `Unassigned to Agent (${unassignedTasks.length})`,
                    subgroups: getStatusSubgroups(unassignedTasks)
                });
            }
            return { type: 'agent', groups: agentGroups };
        }
        
        if (groupBy === 'parent') {
            return {
                type: 'parent',
                groups: getStatusSubgroups(filteredTasks.filter(t => !t.parent_task_id))
            };
        }

        return { type: 'status', groups: [] };

    }, [filteredTasks, projects, agents, groupBy, sortOptions]);

    if (loading && isInitialLoad) {
        return <TaskLoading />;
    }

    if (error) {
        return <TaskError error={error as string} />; // Added 'as string' to satisfy prop type if error can be other types
    }

    const noTasksToShow = groupedAndFilteredTasks.groups.every(group => {
        if (group.tasks?.length) return false; 
        if (group.subgroups?.every(sub => !sub.tasks.length)) return true; 
        if (group.subgroups && group.subgroups.length > 0 && !group.subgroups.some(sub => sub.tasks.length > 0)) return true; 
        if (!group.tasks && !group.subgroups) return true; 
        return false; 
      }) && !loading && !isInitialLoad;

    if (noTasksToShow) {
        return <NoTasks onAddTask={() => handleOpenAddTaskModalCallback(null, null)} />;
    }

    const handleBulkComplete = async () => {
        await Promise.all(selectedTaskIds.map((taskId) => editTask(taskId, { completed: true })));
        setSelectedTaskIds([]);
    };

    const handleBulkDelete = async () => {
        await Promise.all(selectedTaskIds.map((taskId) => deleteTask(taskId)));
        setSelectedTaskIds([]);
    };

    return (
        <Container maxW="container.lg" p={4}>
             <TaskControls 
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onAddTask={() => handleOpenAddTaskModalCallback(null, null)}
             />

            {viewMode === 'list' ? (
                <ListView 
                    groupedTasks={groupedAndFilteredTasks}
                    isLoading={loading || isInitialLoad}
                    isMobile={isMobile}
                />
            ) : (
                <KanbanView 
                    filteredTasks={filteredTasks} 
                    compactView={isMobile}
                    />
                )}

                {isAddTaskModalOpen && (
                <Modal isOpen={isAddTaskModalOpen} onClose={handleCloseAddTaskModalCallback} size={isMobile ? 'full' : 'xl'} isCentered={!isMobile}>
                        <ModalOverlay />
                        <ModalContent bg="bg.modal" color="text.primary" borderColor="border.base" borderWidth="1px">
                            <ModalHeader borderBottomWidth="1px" borderColor="border.base">
                            {editingTask ? 'Edit Task' : parentTaskForNewTask ? 'Add Subtask' : 'Add New Task'}
                            </ModalHeader>
                            <ModalCloseButton color="text.secondary" _hover={{ bg: "interaction.hover", color: "text.primary" }} />
                            <ModalBody py={6}>
                                <AddTaskForm 
                                    initialParentId={parentTaskForNewTask}
                                onClose={handleCloseAddTaskModalCallback} 
                                />
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                )}

                {/* Bulk Actions Bar */}
                {selectedTaskIds.length > 0 && (
                    <Box bg="gray.100" p={2} mb={2} borderRadius="md" display="flex" alignItems="center" gap={2}>
                        <Text>{selectedTaskIds.length} selected</Text>
                        <Button size="sm" colorScheme="green" onClick={() => handleBulkComplete()}>
                            Mark as Complete
                        </Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleBulkDelete()}>
                            Delete Selected
                        </Button>
                    </Box>
                )}
            </Container>
    );
}

export default TaskList;