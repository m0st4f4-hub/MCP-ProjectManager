// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import TaskItem from './TaskItem'; // No longer directly used here
import {
    // Container, // Removed Container
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
import { Task, TaskFilters, GroupByType } from '@/types';
import { formatDisplayName, mapStatusToStatusID } from '@/lib/utils';
import * as statusUtils from '@/lib/statusUtils';
import AddTaskForm from './forms/AddTaskForm';
// Icons are no longer directly used by TaskList:
// import { AddIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore, AgentState } from '@/store/agentStore';
import ListView from './views/ListView';
import TaskControls from './TaskControls';
import NoTasks from './NoTasks'; // Import the new component
import TaskLoading from './TaskLoading'; // Import the new component
import TaskError from './TaskError'; // Import the new component
import KanbanView from './views/KanbanView'; // Import KanbanView
import styles from './TaskList.module.css'; // Added import for CSS Modules

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
    const agents = useAgentStore((state: AgentState) => state.agents);
    const loading = useTaskStore(state => state.loading);
    const error = useTaskStore(state => state.error);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);
    const sortOptions = useTaskStore(state => state.sortOptions);
    // const deleteTask = useTaskStore(state => state.deleteTask); // Unused - keep commented or remove
    const isPolling = useTaskStore(state => state.isPolling);
    const pollingError = useTaskStore(state => state.pollingError);
    const clearPollingError = useTaskStore(state => state.clearPollingError);
    const mutationError = useTaskStore(state => state.mutationError);
    const clearMutationError = useTaskStore(state => state.clearMutationError);
    const filters = useTaskStore(state => state.filters);

    const [, setGroupBy] = useState<GroupByType>('status'); // groupBy is set but not used
    const { /* isOpen: isAddTaskModalOpen, */ onOpen: onOpenAddTaskModal, onClose: onCloseAddTaskModal } = useDisclosure();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

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

    const handleOpenAddTaskModalCallback = useCallback((/* taskToEdit: Task | null = null */) => { // taskToEdit is unused
        // setEditingTask(taskToEdit); // This line was already commented out or removed
        onOpenAddTaskModal();
    }, [onOpenAddTaskModal]); // Removed setParentTaskForNewTask from dependencies

    const handleCloseAddTaskModalCallback = useCallback(() => {
        onCloseAddTaskModal();
        // setEditingTask(null);
        // setParentTaskForNewTask(null); // Removed setParentTaskForNewTask
    }, [onCloseAddTaskModal]); // Removed setParentTaskForNewTask from dependencies

    const applyAllFilters = useCallback((task: Task, currentFilters: TaskFilters): boolean => {
        // Search filter
        if (currentFilters.search) {
            const searchTermLower = currentFilters.search.toLowerCase();
            const titleMatch = task.title?.toLowerCase().includes(searchTermLower);
            const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower);
            if (!titleMatch && !descriptionMatch) return false;
        }

        // Status filter - REVISED LOGIC
        if (currentFilters.status && currentFilters.status !== 'all') { // Only filter if not 'all'
            const taskActualStatusID = mapStatusToStatusID(task.status); // Use helper from /lib/utils
            const taskCategory = getTaskCategory(task); // Use helper, assumes getTaskCategory is available or defined locally

            if (currentFilters.status === 'active') {
                if (taskCategory === 'completed' || taskCategory === 'failed') return false;
            } else if (currentFilters.status === 'completed') {
                if (taskCategory !== 'completed' && taskCategory !== 'failed') return false;
            } else {
                // Assumes currentFilters.status is a specific StatusID like TO_DO, IN_PROGRESS, etc.
                if (taskActualStatusID !== currentFilters.status) return false;
            }
        }
        
        // Hide completed tasks filter (from main filters, not the specific list view toggle)
        // This filter might be redundant if currentFilters.status = 'active' already handles it,
        // but it can serve as an additional override.
        // If status is 'completed', hideCompleted does nothing. If status is 'active', this is redundant.
        // If status is a specific one (e.g. TO_DO), this could still hide it if it were somehow marked completed by category.
        if (currentFilters.hideCompleted && getTaskCategory(task) === 'completed') { // Assumes getTaskCategory is available
            return false;
        }

        // Project filter
        if (currentFilters.projectId) { 
            if (task.project_id !== currentFilters.projectId) return false;
        }

        // Agent filter
        if (currentFilters.agentId) { 
            if (task.agent_id !== currentFilters.agentId) return false;
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

    // Helper function for task category (can be moved to utils if not already there)
    // Ensure this is consistent with the one in Dashboard.tsx or imported from a shared location.
    const getTaskCategory = (task: Task): string => {
        if (!task.status) return 'todo';
        const canonicalStatusId = mapStatusToStatusID(task.status);
        const attributes = statusUtils.getStatusAttributes(canonicalStatusId);
        return attributes ? attributes.category : 'todo';
    };

    const allFilterableTasks = useMemo(() => {
        return tasks.filter(task => applyAllFilters(task, filters));
    }, [tasks, filters, applyAllFilters]);

    const allFilterableTaskIds = useMemo(() => allFilterableTasks.map(t => t.id), [allFilterableTasks]);

    // This memo is for tasks that will be displayed in the List View, respecting top_level_only for grouping.
    const filteredTasksForListView = useMemo(() => {
        // if (filters.top_level_only === false) { // top_level_only filter is removed
            // If not filtering for top-level only, all filterable tasks are candidates for the list view structure.
            // The grouping logic will handle parent_task_id.
            return allFilterableTasks;
        // } else {
            // If top_level_only IS true, then filter down to actual top-level tasks for the initial grouping.
        //     return allFilterableTasks.filter(task => !task.parent_task_id); // Removed parent_task_id check
        // }
    }, [allFilterableTasks]); // Removed filters.top_level_only from dependencies

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
                    return !(attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_'));
                }).length})`,
                tasks: sortTasks(currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return !(attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_'));
                }), sortOptions),
                status: 'active',
            },
            {
                id: 'completed',
                name: `Completed Tasks (${currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return (attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_'));
                }).length})`,
                tasks: sortTasks(currentTasks.filter(t => {
                    const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
                    return (attrs?.category === 'completed' || t.status?.startsWith('COMPLETED_'));
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
                'PENDING_VERIFICATION', 
                'COMPLETED_AWAITING_PROJECT_MANAGER',
                'COMPLETED_HANDOFF_TO_...',
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
                const aDisplayName = statusUtils.getDisplayableStatus(a)?.displayName || a;
                const bDisplayName = statusUtils.getDisplayableStatus(b)?.displayName || b;
                return aDisplayName.localeCompare(bDisplayName);
            });
            
            const statusGroups = allStatusIdsInTasks.map(statusIdKey => {
                const tasksInStatus = tasksByStatusId[statusIdKey] || [];
                const { displayName } = statusUtils.getDisplayableStatus(statusIdKey) || { displayName: statusIdKey };
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
        return <TaskError error={typeof error === 'string' ? error : String(error)} />;
    }

    const noTasksToShow = groupedAndFilteredTasks.groups.every(group => {
        if (group.tasks?.length) return false; 
        if (group.subgroups?.every(sub => !sub.tasks.length)) return true; 
        if (group.subgroups && group.subgroups.length > 0 && !group.subgroups.some(sub => sub.tasks.length > 0)) return true; 
        if (!group.tasks && !group.subgroups) return true; 
        return false; 
      }) && !loading && !isInitialLoad;

    if (noTasksToShow) {
        return <NoTasks onAddTask={() => handleOpenAddTaskModalCallback()} />;
    }

    return (
        <div className={styles.taskListContainer}>
            <TaskControls
                groupBy={effectiveGroupBy}
                setGroupBy={(value: GroupByType) => setGroupBy(value)}
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

            {/* <AddTaskForm 
                isOpen={isAddTaskModalOpen} 
                onClose={handleCloseAddTaskModalCallback} 
                // editingTask={editingTask}
                // parentTaskForNewTask={parentTaskForNewTask}
            /> */}
        </div>
    );
}

export default TaskList;