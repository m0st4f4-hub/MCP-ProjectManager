'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Heading,
    VStack,
    HStack,
    Spinner,
    Text,
    Icon,
    SimpleGrid,
} from '@chakra-ui/react';
import { useTaskStore, TaskState } from '@/store/taskStore';
import { useProjectStore, ProjectState } from '@/store/projectStore';
import { useAgentStore, AgentState } from '@/store/agentStore';
import { FaTasks } from 'react-icons/fa';
import { getStatusAttributes } from '@/lib/statusUtils';
import { mapStatusToStatusID } from '@/lib/utils';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import * as api from '@/services/api';
import {
    // getUnassignedTaskPrompt, // Removed
} from '@/lib/promptUtils';
import DashboardStatsGrid from './dashboard/DashboardStatsGrid';
import TaskStatusChart from './dashboard/TaskStatusChart';
import TasksOverTimeChart from './dashboard/TasksOverTimeChart';
import ProjectProgressChart from './dashboard/ProjectProgressChart';
import AgentWorkloadChart from './dashboard/AgentWorkloadChart';
import UnassignedTasksList from './dashboard/UnassignedTasksList';
import TopPerformersLists from './dashboard/TopPerformersLists';
import RecentActivityList from './dashboard/RecentActivityList';
import { Agent } from '@/types/agent';
import styles from './Dashboard.module.css';

const COLORS = ['#3182ce', '#38a169', '#e53e3e', '#d69e2e', '#805ad5', '#319795', '#f6ad55', '#718096'];

const getTaskCategory = (task: Task): string => {
    if (!task.status) return 'todo';
    const canonicalStatusId = mapStatusToStatusID(task.status);
    const attributes = getStatusAttributes(canonicalStatusId);
    return attributes ? attributes.category : 'todo';
};

// Define selectors outside the component for stable references
const selectTaskFilters = (state: TaskState) => state.filters;
const selectProjectFilters = (state: ProjectState) => state.filters;

const Dashboard: React.FC = () => {
    const tasks = useTaskStore(state => state.tasks);
    const isLoadingTasks = useTaskStore(state => state.loading);
    const tasksError = useTaskStore(state => state.error);
    const taskFiltersFromStore = useTaskStore(selectTaskFilters);

    const projects = useProjectStore(state => state.projects);
    const isLoadingProjects = useProjectStore(state => state.loading);
    const projectsError = useProjectStore(state => state.error);
    const projectStoreFilters = useProjectStore(selectProjectFilters);

    const agents = useAgentStore((state: AgentState) => state.agents);
    const isLoadingAgents = useAgentStore((state: AgentState) => state.loading);
    const agentsError = useAgentStore((state: AgentState) => state.error);

    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [isLoadingAll, setIsLoadingAll] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoadingAll(true); // Ensure loading state is true at the start
            try {
                const [projectsFromApi, tasksFromApi] = await Promise.all([
                    api.getProjects({ is_archived: null }),
                    api.getTasks({ is_archived: null })
                ]);
                setAllProjects(projectsFromApi || []);
                setAllTasks(tasksFromApi || []);
            } catch (error) {
                console.error("Error fetching all projects/tasks for dashboard totals:", error);
                setAllProjects([]);
                setAllTasks([]);
            } finally {
                setIsLoadingAll(false);
            }
        };
        fetchAllData();
    }, []);

    const filteredTasksForDashboard = useMemo(() => {
        return tasks.filter(task => {
            if (typeof taskFiltersFromStore?.is_archived === 'boolean') {
                if (task.is_archived !== taskFiltersFromStore.is_archived) return false;
            } else {
                if (task.is_archived) return false;
            }
            if (taskFiltersFromStore?.projectId && task.project_id !== taskFiltersFromStore.projectId) {
                return false;
            }
            if (taskFiltersFromStore?.status && taskFiltersFromStore.status !== 'all') {
                const taskCategory = getTaskCategory(task);
                if (taskFiltersFromStore.status === 'active') {
                    if (taskCategory === 'completed' || taskCategory === 'failed') return false;
                } else if (taskFiltersFromStore.status === 'completed') {
                    if (taskCategory !== 'completed' && taskCategory !== 'failed') return false;
                }
            }
            if (taskFiltersFromStore?.agentId && task.agent_id !== taskFiltersFromStore.agentId) {
                return false;
            }
            if (taskFiltersFromStore?.search) {
                const searchTermLower = taskFiltersFromStore.search.toLowerCase();
                const titleMatch = task.title?.toLowerCase().includes(searchTermLower);
                const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower);
                if (!titleMatch && !descriptionMatch) return false;
            }
            if (taskFiltersFromStore?.hideCompleted && getTaskCategory(task) === 'completed') {
                return false;
            }
            return true;
        });
    }, [tasks, taskFiltersFromStore]);

    const filteredProjectsForDashboard = useMemo(() => {
        return projects.filter(project => {
            if (typeof projectStoreFilters?.is_archived === 'boolean') {
                if (project.is_archived !== projectStoreFilters.is_archived) return false;
            } else {
                 if (project.is_archived) return false;
            }
            if (taskFiltersFromStore?.projectId && project.id !== taskFiltersFromStore.projectId) {
                return false;
            }
            return true;
        });
    }, [projects, projectStoreFilters?.is_archived, taskFiltersFromStore?.projectId]);

    const totalArchivedProjects = useMemo(() => {
        const filtered = allProjects.filter(project => project.is_archived);
        return filtered.length;
    }, [allProjects]);

    const totalArchivedTasks = useMemo(() => {
        const filtered = allTasks.filter(task => task.is_archived);
        return filtered.length;
    }, [allTasks]);

    const taskStats = useMemo(() => {
        let completed = 0, failed = 0, inProgress = 0, blocked = 0, toDo = 0;
        filteredTasksForDashboard.forEach(task => {
            const category = getTaskCategory(task);
            switch (category) {
                case 'completed': completed++; break;
                case 'failed': failed++; break;
                case 'inProgress': inProgress++; break;
                case 'blocked': blocked++; break;
                case 'pendingInput': toDo++; break;
                case 'todo': default: toDo++; break;
            }
        });
        return { completed, failed, inProgress, blocked, toDo, total: filteredTasksForDashboard.length };
    }, [filteredTasksForDashboard]);

    const unassignedTasks = useMemo(() => filteredTasksForDashboard.filter(task => !task.agent_id && !task.agent_name), [filteredTasksForDashboard]);
    const agentsWithTasks = agents.filter((agent: Agent) => filteredTasksForDashboard.some(task => task.agent_id === agent.id));
    const idleAgents = agents.filter((agent: Agent) => !filteredTasksForDashboard.some(task => task.agent_id === agent.id));
    const activeAgentsCount = agentsWithTasks.length;

    const tasksOverTime = useMemo(() => {
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().slice(0, 10);
        });
        return days.map(date => {
            const createdCount = filteredTasksForDashboard.filter(t => t.created_at && t.created_at.slice(0, 10) === date).length;
            const completedInPeriodCount = filteredTasksForDashboard.filter(t => getTaskCategory(t) === 'completed' && t.updated_at && t.updated_at.slice(0, 10) === date).length;
            return { date, created: createdCount, completed: completedInPeriodCount };
        });
    }, [filteredTasksForDashboard]);

    const tasksPerProject = useMemo(() => {
        return filteredProjectsForDashboard.map((project, i) => ({
            name: project.name,
            value: filteredTasksForDashboard.filter(t => t.project_id === project.id).length,
            color: COLORS[i % COLORS.length],
            progress: (() => {
                const totalProjectTasks = filteredTasksForDashboard.filter(t => t.project_id === project.id).length;
                const doneProjectTasks = filteredTasksForDashboard.filter(t => t.project_id === project.id && getTaskCategory(t) === 'completed').length;
                return totalProjectTasks > 0 ? Math.round((doneProjectTasks / totalProjectTasks) * 100) : 0;
            })(),
        })).sort((a, b) => b.value - a.value);
    }, [filteredProjectsForDashboard, filteredTasksForDashboard]);

    const tasksPerAgent = useMemo(() => {
        const agentData = agents.map((agent: Agent, i: number) => ({
            name: agent.name,
            value: filteredTasksForDashboard.filter(t => t.agent_id === agent.id).length,
            color: COLORS[i % COLORS.length],
        }));
        const unassignedCount = unassignedTasks.length;
        if (unassignedCount > 0) {
            agentData.push({ name: 'Unassigned', value: unassignedCount, color: '#CBD5E1' });
        }
        return agentData.sort((a: { value: number }, b: { value: number }) => b.value - a.value);
    }, [agents, filteredTasksForDashboard, unassignedTasks]);

    const statusCounts = useMemo(() => {
        const { toDo, inProgress, blocked, completed, failed } = taskStats;
        const rawCounts = [
            { name: 'To Do', value: toDo },
            { name: 'In Progress', value: inProgress },
            { name: 'Blocked', value: blocked },
            { name: 'Completed', value: completed },
            { name: 'Failed', value: failed },
        ];
        return rawCounts
            .filter(item => item.value > 0)
            .map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }));
    }, [taskStats]);

    const safeTasksPerAgent = Array.isArray(tasksPerAgent) ? tasksPerAgent : [];
    const topAgents = safeTasksPerAgent.filter(a => a.name !== 'Unassigned').slice(0, 3);

    const safeTasksPerProject = Array.isArray(tasksPerProject) ? tasksPerProject : [];
    const topProjects = safeTasksPerProject.slice(0, 3);

    const recentActivity = useMemo(() => {
        return filteredTasksForDashboard
            .slice()
            .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
            .slice(0, 5)
            .map(task => ({
                type: getTaskCategory(task) === 'completed' ? 'Completed' : (task.status || 'Updated'),
                title: task.title,
                date: task.updated_at || task.created_at,
                agent: agents.find(a => a.id === task.agent_id)?.name,
                project: filteredProjectsForDashboard.find(p => p.id === task.project_id)?.name,
            }));
    }, [filteredTasksForDashboard, agents, filteredProjectsForDashboard]);

    if (isLoadingTasks || isLoadingProjects || isLoadingAgents || isLoadingAll) {
        return (
            <VStack className={styles.loadingSpinnerContainer}>
                <Spinner size="xl" color="icon.primary" />
                <Text>Loading dashboard data...</Text>
            </VStack>
        );
    }

    if (tasksError || projectsError || agentsError) {
        return (
            <VStack className={styles.dashboardContainer}>
                <Text className={styles.errorMessage}>
                    Error loading dashboard data. {tasksError || projectsError || agentsError}
                </Text>
            </VStack>
        );
    }

    if (tasks.length === 0 && projects.length === 0 && agents.length === 0) {
        return (
            <VStack className={styles.dashboardContainer}>
                <Text className={styles.noDataMessage}>No data available to display on the dashboard.</Text>
            </VStack>
        );
    }

    return (
        <VStack spacing={8} align="stretch" className={styles.dashboardContainer}>
            <HStack justify="space-between" align="center">
                <HStack spacing={3} align="center">
                    <Icon as={FaTasks} w={8} h={8} color="icon.primary" className={styles.dashboardIcon} />
                    <Heading as="h1" size="xl" className={styles.dashboardHeading}>
                        Dashboard Overview
                    </Heading>
                </HStack>
                {/* Add any top-right controls here if needed */}
            </HStack>

            <DashboardStatsGrid 
                taskStats={taskStats} 
                totalProjects={filteredProjectsForDashboard.length}
                activeAgentsCount={activeAgentsCount}
                unassignedTasksCount={unassignedTasks.length}
                totalArchivedProjects={totalArchivedProjects}
                totalArchivedTasks={totalArchivedTasks}
            />

            {filteredTasksForDashboard.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} className={styles.dashboardGrid}>
                    <VStack spacing={4} align="stretch" className={styles.chartContainer}>
                        <Heading as="h2" size="lg" className={styles.sectionHeading}>Task Status Distribution</Heading>
                        <TaskStatusChart statusCounts={statusCounts} />
                    </VStack>
                    <VStack spacing={4} align="stretch" className={styles.chartContainer}>
                        <Heading as="h2" size="lg" className={styles.sectionHeading}>Tasks - Created vs Completed (Last 14 Days)</Heading>
                        <TasksOverTimeChart tasksOverTime={tasksOverTime} />
                    </VStack>
                </SimpleGrid>
            )}
            
            {filteredProjectsForDashboard.length > 0 && (
                <VStack spacing={4} align="stretch" className={styles.chartContainer}>
                     <Heading as="h2" size="lg" className={styles.sectionHeading}>Project Progress</Heading>
                    <ProjectProgressChart tasksPerProject={tasksPerProject} />
                </VStack>
            )}

            {agentsWithTasks.length > 0 && (
                 <VStack spacing={4} align="stretch" className={styles.chartContainer}>
                    <Heading as="h2" size="lg" className={styles.sectionHeading}>Agent Workload</Heading>
                    <AgentWorkloadChart tasksPerAgent={tasksPerAgent} />
                </VStack>
            )}
            
            <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={6} className={styles.dashboardGrid}>
                 {(unassignedTasks.length > 0 || idleAgents.length > 0) &&
                    <VStack spacing={4} align="stretch">
                        {unassignedTasks.length > 0 && 
                            <VStack spacing={4} align="stretch" className={styles.chartContainer}> 
                                <Heading as="h2" size="lg" className={styles.sectionHeading}>Unassigned Tasks</Heading>
                                <UnassignedTasksList unassignedTasks={unassignedTasks} projects={filteredProjectsForDashboard} />
                            </VStack>
                        }
                        {/* Consider adding Idle Agents List here if desired */}
                         {/* {idleAgents.length > 0 && 
                            <VStack spacing={4} align="stretch" className={styles.chartContainer}>
                                <Heading as="h2" size="lg" className={styles.sectionHeading}>Idle Agents</Heading>
                                <Text>Idle agents list placeholder</Text> 
                            </VStack> 
                        } */} 
                    </VStack>
                 }
                <VStack spacing={4} align="stretch" className={styles.chartContainer}>
                    <Heading as="h2" size="lg" className={styles.sectionHeading}>Recent Activity & Top Performers</Heading>
                    <TopPerformersLists topAgents={topAgents} topProjects={topProjects} />
                    <RecentActivityList recentActivity={recentActivity} />
                </VStack>
            </SimpleGrid>

        </VStack>
    );
};

export default Dashboard; 