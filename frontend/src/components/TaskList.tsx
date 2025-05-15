// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import TaskItem from './TaskItem'; // No longer directly used here
import {
    Container,
    useBreakpointValue,
    useDisclosure,
    useToast,
    // Button, // Unused - Remove
    // Spinner, // Unused - Remove
    // Heading, // Unused - Remove
    // Flex, // Unused - Remove
    // Badge, // Unused - Remove
} from '@chakra-ui/react';
import { useTaskStore, sortTasks } from '@/store/taskStore';
import { Task } from '@/types'; // TaskStatus is unused
import { formatDisplayName } from '@/lib/utils';
import * as statusUtils from '@/lib/statusUtils';
import { shallow } from 'zustand/shallow';
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

type GroupByType = 'status' | 'project' | 'agent';
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
    // const deleteTask = useTaskStore(state => state.deleteTask); // Unused - keep commented or remove
    const isPolling = useTaskStore(state => state.isPolling);
    const pollingError = useTaskStore(state => state.pollingError);
    const clearPollingError = useTaskStore(state => state.clearPollingError);
    const mutationError = useTaskStore(state => state.mutationError);
    const clearMutationError = useTaskStore(state => state.clearMutationError);
    const filters = useTaskStore(state => state.filters, shallow);

    const [, setGroupBy] = useState<GroupByType>('status'); // groupBy is set but not used
    const { isOpen: isAddTaskModalOpen, onOpen: onOpenAddTaskModal, onClose: onCloseAddTaskModal } = useDisclosure();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [parentTaskForNewTask, setParentTaskForNewTask] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const { } = useDisclosure(); // isFilterOpen and onFilterOpen are unused, onFilterClose was removed previously

    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

    // const boardRef = useRef<HTMLDivElement>(null); // For Kanban later
    // const [isCompact, setIsCompact] = useState(false); // For Kanban later

    useEffect(() => {
        fetchTasks();
        fetchProjectsAndAgents();
    }, [fetchTasks, fetchProjectsAndAgents]);

    useEffect(() => {
        if (isInitialLoad && tasks.length > 0 && !loading) {
            setIsInitialLoad(false);
        }
    }, [tasks, isInitialLoad, loading]);

    useEffect(() => {
        if (pollingError) {
            toast({
                title: "Polling Error",
                description: pollingError,
                status: "warning",
                duration: 5000,
                isClosable: true,
                onCloseComplete: () => {
                    clearPollingError();
                }
            });
        }
    }, [pollingError, toast, clearPollingError]);

    useEffect(() => {
        if (mutationError) {
            toast({
                title: `Task Operation Failed (${mutationError.type})`,
                description: mutationError.message,
                status: "error",
                duration: 7000,
                isClosable: true,
                onCloseComplete: () => {
                    clearMutationError();
                }
            });
        }
    }, [mutationError, toast, clearMutationError]);

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

    const applyAllFilters = useCallback((task: Task, currentFilters: TaskFilters): boolean => {
        // Search filter
        if (currentFilters.search) {
            const searchTermLower = currentFilters.search.toLowerCase();
            const titleMatch = task.title?.toLowerCase().includes(searchTermLower);
            const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower);
            if (!titleMatch && !descriptionMatch) return false;
        }

        // Status filter (using the existing logic for active/completed from TaskControls)
        const taskStatusStr = task.status || 'TO_DO'; // Default to TO_DO if status is null/undefined
        const statusAttributes = statusUtils.getStatusAttributes(taskStatusStr as statusUtils.StatusID);
        let isEffectivelyCompleted = task.completed || false;
        if (statusAttributes) {
            if (statusAttributes.category === 'completed' || statusAttributes.category === 'failed') {
                isEffectivelyCompleted = true;
            }
        } else if (taskStatusStr.startsWith('COMPLETED_')) { 
            isEffectivelyCompleted = true;
        }

        if (currentFilters.status && currentFilters.status !== 'all') {
            if (currentFilters.status === 'completed' && !isEffectivelyCompleted) return false;
            if (currentFilters.status === 'active' && isEffectivelyCompleted) return false;
        }
        
        // Hide completed tasks filter (from main filters, not the specific list view toggle)
        if (currentFilters.hideCompleted && isEffectivelyCompleted) return false;

        // Project filter
        if (currentFilters.projectId) { 
            if (task.project_id !== currentFilters.projectId) return false;
        }

        // Agent filter
        if (currentFilters.agentId) { 
            if (task.agent_id !== currentFilters.agentId) return false;
        }

        // Top-level only filter - this should only apply if the filter is set to true
        if (currentFilters.top_level_only === true && task.parent_task_id) {
            return false;
        }

        // Archive filter
        if (typeof currentFilters.is_archived === 'boolean') {
            if (task.is_archived !== currentFilters.is_archived) {
                return false;
            }
        } else {
            // Default behavior if is_archived is not explicitly set (e.g. null or undefined in filters)
            // could be to show non-archived, or adjust as per requirements.
            // For now, if not a boolean, we assume it's not an active filter here,
            // or the backend default (false) handles it.
            // However, our store initializes to false, so it should always be boolean.
            // To be safe, let's default to showing non-archived if filter is not a boolean.
            if (task.is_archived) {
                return false;
            }
        }

        return true; // Task passes all filters
    }, []); // Dependencies: statusUtils is stable. Filters are handled by useMemo consumers.

    const allFilterableTasks = useMemo(() => {
        return tasks.filter(task => applyAllFilters(task, filters));
    }, [tasks, filters, applyAllFilters]);

    const allFilterableTaskIds = useMemo(() => allFilterableTasks.map(t => t.id), [allFilterableTasks]);

    // This memo is for tasks that will be displayed in the List View, respecting top_level_only for grouping.
    const filteredTasksForListView = useMemo(() => {
        if (filters.top_level_only === false) {
            // If not filtering for top-level only, all filterable tasks are candidates for the list view structure.
            // The grouping logic will handle parent_task_id.
            return allFilterableTasks;
        } else {
            // If top_level_only IS true, then filter down to actual top-level tasks for the initial grouping.
            return allFilterableTasks.filter(task => !task.parent_task_id);
        }
    }, [allFilterableTasks, filters.top_level_only]);

    const tasksForKanbanView = useMemo(() => {
        // Kanban view typically shows all tasks that pass filters, regardless of parent_task_id, as it's flat.
        return allFilterableTasks;
    }, [allFilterableTasks]);

    // Force groupBy to 'status' in Kanban view
    const effectiveGroupBy = viewMode === 'kanban' ? 'status' : 'status';

    const groupedAndFilteredTasks: GroupedTasks = useMemo(() => {
        const topLevelTasks = filteredTasksForListView; 
        
        const getStatusSubgroupsForProjectOrAgent = (currentTasks: Task[]) => ([
            {
                id: 'active',
                name: `Active Tasks (${currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return !(attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_') || t.completed);
                }).length})`,
                tasks: sortTasks(currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return !(attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_') || t.completed);
                }), sortOptions),
                status: 'active',
            },
            {
                id: 'completed',
                name: `Completed Tasks (${currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return (attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_') || t.completed);
                }).length})`,
                tasks: sortTasks(currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return (attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_') || t.completed);
                }), sortOptions),
                status: 'completed',
            }
        ]);

        if (effectiveGroupBy === 'status') {
            const tasksByStatusId: { [key in statusUtils.StatusID]?: Task[] } = {};
            
            topLevelTasks.forEach(task => { // Use topLevelTasks which respects top_level_only for list view
                const currentTaskStatusId = (task.status || 'TO_DO') as statusUtils.StatusID; // Ensure it's a valid StatusID
                
                if (!tasksByStatusId[currentTaskStatusId]) {
                    tasksByStatusId[currentTaskStatusId] = [];
                }
                tasksByStatusId[currentTaskStatusId]!.push(task);
            });

            // Get all unique StatusIDs present in the tasks
            const allStatusIdsInTasks = Object.keys(tasksByStatusId) as statusUtils.StatusID[];

            // Define a preferred order for StatusIDs directly
            // This order should ideally come from statusUtils or be comprehensive
            const preferredStatusOrder: statusUtils.StatusID[] = [
                'TO_DO', 
                'IN_PROGRESS', 
                'BLOCKED', 
                'PENDING_REVIEW', 
                'COMPLETED_AWAITING_VERIFICATION',
                'HANDOFF_DESIGN',
                'HANDOFF_ENGINEERING',
                'HANDOFF_QA',
                'FAILED', 
                'COMPLETED'
            ];
            
            // Sort status IDs: preferred first, then alphabetically by display name for others not in preferred list
            allStatusIdsInTasks.sort((a, b) => {
                const aIndex = preferredStatusOrder.indexOf(a);
                const bIndex = preferredStatusOrder.indexOf(b);

                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                // For statuses not in preferred order, sort by their display name
                const aDisplayName = statusUtils.getDisplayableStatus(a).displayName;
                const bDisplayName = statusUtils.getDisplayableStatus(b).displayName;
                return aDisplayName.localeCompare(bDisplayName);
            });
            
            const statusGroups = allStatusIdsInTasks.map(statusIdKey => {
                const tasksInStatus = tasksByStatusId[statusIdKey] || [];
                const { displayName } = statusUtils.getDisplayableStatus(statusIdKey);
                return {
                    id: statusIdKey, 
                    name: `${displayName} (${tasksInStatus.length})`,
                    tasks: sortTasks(tasksInStatus, sortOptions),
                    status: statusIdKey, // Store the actual StatusID
                };
            }).filter(group => group.tasks.length > 0);

            return {
                type: 'status',
                groups: statusGroups,
            };
        }

        if (effectiveGroupBy === 'project') {
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
                subgroups: getStatusSubgroupsForProjectOrAgent(tasksByProject[project.id] || [])
            }));
            if (unassignedTasks.length > 0) {
                projectGroups.push({
                    id: 'unassigned_project',
                    name: `Unassigned to Project (${unassignedTasks.length})`,
                    subgroups: getStatusSubgroupsForProjectOrAgent(unassignedTasks)
                });
            }
            return { type: 'project', groups: projectGroups };
        }

        if (effectiveGroupBy === 'agent') {
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
                subgroups: getStatusSubgroupsForProjectOrAgent(tasksByAgent[agent.id] || [])
            }));
            if (unassignedTasks.length > 0) {
                agentGroups.push({
                    id: 'unassigned_agent',
                    name: `Unassigned to Agent (${unassignedTasks.length})`,
                    subgroups: getStatusSubgroupsForProjectOrAgent(unassignedTasks)
                });
            }
            return { type: 'agent', groups: agentGroups };
        }

        return { type: 'status', groups: [] };

    }, [filteredTasksForListView, projects, agents, effectiveGroupBy, sortOptions]); // Removed filters.top_level_only as it's handled in filteredTasksForListView

    if (loading && isInitialLoad) {
        return <TaskLoading />;
    }

    if (error) {
        return <TaskError error={error as Error | string} onRetry={fetchTasks} />;
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

    return (
        <Container maxW="full" p={{ base: 0, md: 4 }} bg="bg.page" flex={1}>
            <TaskControls
                groupBy={effectiveGroupBy}
                setGroupBy={setGroupBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onAddTask={handleOpenAddTaskModalCallback}
                isPolling={isPolling}
                allFilterableTaskIds={allFilterableTaskIds}
            />

            {/* <Heading size="lg" mb={6} color="text.heading">Tasks</Heading> */}
            
            {/* Conditional Rendering based on viewMode */}
            {viewMode === 'list' && (
                <ListView 
                    groupedTasks={groupedAndFilteredTasks} 
                    isLoading={loading && isInitialLoad} 
                    isMobile={isMobile}
                />
            )}
            {viewMode === 'kanban' && (
                <KanbanView 
                    filteredTasks={tasksForKanbanView} 
                    // onOpenModal={handleOpenAddTaskModalCallback} // If needed later for Kanban
                    compactView={isMobile} // Or a specific compact state for Kanban
                />
            )}

            {(!loading || !isInitialLoad) && tasks.length === 0 && (
                <NoTasks onAddTask={handleOpenAddTaskModalCallback} />
            )}

            <AddTaskForm
                isOpen={isAddTaskModalOpen}
                onClose={handleCloseAddTaskModalCallback}
                taskToEdit={editingTask}
                parentTaskId={parentTaskForNewTask}
                allProjects={projects} // Pass all projects to the form
                allAgents={agents} // Pass all agents to the form
            />
        </Container>
    );
}

export default TaskList;