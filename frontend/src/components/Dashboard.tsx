"use client";

import React, { useMemo, useState } from "react";
import {
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  useToken,
  Box,
  Select,
  FormControl,
  FormLabel,
  Checkbox,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  TimeIcon,
  WarningTwoIcon,
  RepeatClockIcon,
} from "@chakra-ui/icons";
import { FaTasks } from "react-icons/fa";
import { GoProject } from "react-icons/go";
import { BsPerson } from "react-icons/bs";
import { Archive as LucideArchive } from "lucide-react";

import { useTaskStore, TaskState } from "@/store/taskStore";
import { useProjectStore, ProjectState } from "@/store/projectStore";
import { useAgentStore, AgentState } from "@/store/agentStore";

import { getTaskCategory } from "@/lib/taskUtils";

import { Agent } from "@/types/agent";
import { Task } from "@/types/task";

import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useFilteredProjects } from "@/hooks/useFilteredProjects";

import AppIcon from "./common/AppIcon";
import DashboardStatsGrid from "./dashboard/DashboardStatsGrid";
import TaskStatusChart from "./dashboard/TaskStatusChart";
import TasksOverTimeChart from "./dashboard/TasksOverTimeChart";
import ProjectProgressChart from "./dashboard/ProjectProgressChart";
import AgentWorkloadChart from "./dashboard/AgentWorkloadChart";
import UnassignedTasksList from "./dashboard/UnassignedTasksList";
import TopPerformersLists from "./dashboard/TopPerformersLists";
import RecentActivityList from "./dashboard/RecentActivityList";
import DashboardSection from "./dashboard/DashboardSection";
import { sizing, typography, semanticColors } from "../tokens";
import { useDashboardData } from "./dashboard/useDashboardData";
import DashboardLoading from "./dashboard/DashboardLoading";
import DashboardError from "./dashboard/DashboardError";
import TaskList from "./TaskList";

// Define selectors outside the component for stable references
const selectTaskFilters = (state: TaskState) => state.filters;
const selectProjectFilters = (state: ProjectState) => state.filters;
const selectSetTaskFilters = (state: TaskState) => state.setFilters;

const Dashboard: React.FC = () => {
  const tasksFromStore = useTaskStore((state) => state.tasks);
  const isLoadingTasks = useTaskStore((state) => state.loading);
  const tasksError = useTaskStore((state) => state.error);
  const taskFiltersFromStore = useTaskStore(selectTaskFilters);
  const setTaskFilters = useTaskStore(selectSetTaskFilters);

  const projectsFromStore = useProjectStore((state) => state.projects);
  const isLoadingProjects = useProjectStore((state) => state.loading);
  const projectsError = useProjectStore((state) => state.error);
  const projectFiltersFromStore = useProjectStore(selectProjectFilters);

  const agents = useAgentStore((state: AgentState) => state.agents);
  const isLoadingAgents = useAgentStore((state: AgentState) => state.loading);
  const agentsError = useAgentStore((state: AgentState) => state.error);

  const {
    allProjects,
    allTasks,
    isLoadingAll,
    initialLoadError,
  } = useDashboardData();

  const [
    blue500,
    green500,
    red500,
    yellow600,
    purple600,
    teal500,
    orange400,
    neutralGray600,
  ] = useToken("colors", [
    "blue.500",
    "green.500",
    "red.500",
    "yellow.600",
    "purple.600",
    "teal.500",
    "orange.400",
    "neutralGray.600",
  ]);

  const THEME_COLORS = useMemo(
    () => [
      blue500,
      green500,
      red500,
      yellow600,
      purple600,
      teal500,
      orange400,
      neutralGray600,
    ],
    [
      blue500,
      green500,
      red500,
      yellow600,
      purple600,
      teal500,
      orange400,
      neutralGray600,
    ],
  );

  // Use the new custom hooks for filtering
  const filteredTasksForDashboard = useFilteredTasks(
    tasksFromStore,
    taskFiltersFromStore,
  );
  const filteredProjectsForDashboard = useFilteredProjects(
    projectsFromStore,
    projectFiltersFromStore,
    taskFiltersFromStore?.projectId,
  );

  // State for local filtering and sorting UI controls
  const [agentFilter, setAgentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Update task store filters when local state changes
  useMemo(() => {
    setTaskFilters({
      ...taskFiltersFromStore,
      agentId: agentFilter || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      is_archived: showArchived ? undefined : false,
    });
  }, [agentFilter, statusFilter, showArchived, setTaskFilters, taskFiltersFromStore]);

  const totalArchivedTasks = useMemo(() => {
    const filtered = allTasks.filter((task) => task.is_archived);
    return filtered.length;
  }, [allTasks]);

  const taskStats = useMemo(() => {
    let completed = 0,
      failed = 0,
      inProgress = 0,
      blocked = 0,
      toDo = 0;
    filteredTasksForDashboard.forEach((task) => {
      const category = getTaskCategory(task);
      switch (category) {
        case "completed":
          completed++;
          break;
        case "failed":
          failed++;
          break;
        case "inProgress":
          inProgress++;
          break;
        case "blocked":
          blocked++;
          break;
        case "pendingInput":
          toDo++;
          break;
        case "todo":
        default:
          toDo++;
          break;
      }
    });
    return {
      completed,
      failed,
      inProgress,
      blocked,
      toDo,
      total: filteredTasksForDashboard.length,
    };
  }, [filteredTasksForDashboard]);

  const unassignedTasks = useMemo(
    () =>
      filteredTasksForDashboard.filter(
        (task) => !task.agent_id && !task.agent_name,
      ),
    [filteredTasksForDashboard],
  );

  const tasksOverTime = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });
    return days.map((date) => {
      const createdCount = filteredTasksForDashboard.filter(
        (t) => t.created_at && t.created_at.slice(0, 10) === date,
      ).length;
      const completedInPeriodCount = filteredTasksForDashboard.filter(
        (t) =>
          getTaskCategory(t) === "completed" &&
          t.updated_at &&
          t.updated_at.slice(0, 10) === date,
      ).length;
      return { date, created: createdCount, completed: completedInPeriodCount };
    });
  }, [filteredTasksForDashboard]);

  const tasksPerProject = useMemo(() => {
    return filteredProjectsForDashboard
      .map((project, i) => ({
        name: project.name,
        value: project.task_count ?? 0,
        color: THEME_COLORS[i % THEME_COLORS.length],
        progress: project.progress ?? (
          project.task_count && project.completed_task_count
            ? Math.round((project.completed_task_count / project.task_count) * 100)
            : 0
        ),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjectsForDashboard, THEME_COLORS]);

  const tasksPerAgent = useMemo(() => {
    const agentData = agents.map((agent: Agent, i: number) => ({
      name: agent.name,
      tasks: agent.task_count ?? 0,
      color: THEME_COLORS[i % THEME_COLORS.length],
    }));
    const unassignedCount = unassignedTasks.length;
    if (unassignedCount > 0) {
      agentData.push({
        name: "Unassigned",
        tasks: unassignedCount,
        color: neutralGray600,
      });
    }
    return agentData.sort(
      (a: { tasks: number }, b: { tasks: number }) => b.tasks - a.tasks,
    );
  }, [
    agents,
    unassignedTasks,
    THEME_COLORS,
    neutralGray600,
  ]);

  const statusCounts = useMemo(() => {
    const { toDo, inProgress, blocked, completed, failed } = taskStats;
    const rawCounts = [
      { name: "To Do", value: toDo },
      { name: "In Progress", value: inProgress },
      { name: "Blocked", value: blocked },
      { name: "Completed", value: completed },
      { name: "Failed", value: failed },
    ];
    return rawCounts
      .filter((item) => item.value > 0)
      .map((item, i) => ({
        ...item,
        color: THEME_COLORS[i % THEME_COLORS.length],
      }));
  }, [taskStats, THEME_COLORS]);

  const safeTasksPerAgent = Array.isArray(tasksPerAgent) ? tasksPerAgent : [];
  const topAgents = safeTasksPerAgent
    .filter((a) => a.name !== "Unassigned")
    .slice(0, 3);

  const safeTasksPerProject = Array.isArray(tasksPerProject)
    ? tasksPerProject
    : [];
  const topProjects = safeTasksPerProject.slice(0, 3);

  const recentActivity = useMemo(() => {
    return filteredTasksForDashboard
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0).getTime() -
          new Date(a.updated_at || a.created_at || 0).getTime(),
      )
      .slice(0, 5)
      .map((task) => ({
        type:
          getTaskCategory(task) === "completed"
            ? "Completed"
            : task.status || "Updated",
        title: task.title,
        date: task.updated_at || task.created_at,
        agent: agents.find((a) => a.id === task.agent_id)?.name,
        project: filteredProjectsForDashboard.find(
          (p) => p.id === task.project_id,
        )?.name,
      }));
  }, [filteredTasksForDashboard, agents, filteredProjectsForDashboard]);

  // Map topAgents to match PerformerItem structure (tasks -> value)
  const topAgentsForList = useMemo(
    () =>
      topAgents.map((agent) => ({
        name: agent.name,
        value: agent.tasks,
      })),
    [topAgents],
  );

  const projectSummaryStats = useMemo(() => {
    const activeFilteredProjects = filteredProjectsForDashboard.filter(
      (p) => !p.is_archived,
    ).length;
    // allProjects contains all projects fetched initially (archived and non-archived)
    const totalNonArchivedSystemProjects = allProjects.filter(
      (p) => !p.is_archived,
    ).length;
    const totalArchivedSystemProjects = allProjects.filter(
      (p) => p.is_archived,
    ).length;
    return {
      activeFiltered: activeFilteredProjects,
      totalSystemActive: totalNonArchivedSystemProjects,
      totalSystemArchived: totalArchivedSystemProjects,
    };
  }, [filteredProjectsForDashboard, allProjects]);

  const overallStats = useMemo(() => {
    const { toDo, inProgress, completed, failed, blocked } = taskStats;
    return [
      {
        id: "total-tasks",
        label: "Total Tasks (Active Filters)",
        value: filteredTasksForDashboard.length,
        icon: FaTasks,
        iconColor: "blue.500",
      },
      {
        id: "completed-tasks",
        label: "Completed",
        value: completed,
        icon: CheckCircleIcon,
        iconColor: "green.500",
      },
      {
        id: "in-progress-tasks",
        label: "In Progress",
        value: inProgress,
        icon: RepeatClockIcon,
        iconColor: "yellow.600",
      },
      {
        id: "pending-tasks",
        label: "To Do / Pending",
        value: toDo,
        icon: TimeIcon,
        iconColor: "purple.500",
      },
      {
        id: "failed-tasks",
        label: "Failed",
        value: failed,
        icon: WarningTwoIcon,
        iconColor: "red.500",
      },
      {
        id: "blocked-tasks",
        label: "Blocked",
        value: blocked,
        icon: WarningTwoIcon,
        iconColor: "orange.500",
      },
      {
        id: "active-projects-filtered",
        label: "Active Projects (Filters)",
        value: projectSummaryStats.activeFiltered,
        icon: GoProject,
        iconColor: "teal.500",
      },
      {
        id: "total-active-projects-system",
        label: "Total Active Projects (System)",
        value: projectSummaryStats.totalSystemActive,
        icon: GoProject,
        iconColor: "teal.600",
      },
      {
        id: "total-agents",
        label: "Total Agents",
        value: agents.length,
        icon: BsPerson,
        iconColor: "cyan.500",
      },
      {
        id: "archived-projects-system",
        label: "Archived Projects (System)",
        value: projectSummaryStats.totalSystemArchived,
        icon: LucideArchive,
        iconColor: "gray.500",
      },
      {
        id: "archived-tasks-system",
        label: "Archived Tasks (System)",
        value: totalArchivedTasks,
        icon: LucideArchive,
        iconColor: "gray.400",
      },
    ];
  }, [
    taskStats,
    filteredTasksForDashboard.length,
    projectSummaryStats,
    agents.length,
    totalArchivedTasks,
  ]);

  // Apply sorting to the filtered tasks
  const sortedTasks = useMemo(() => {
    const tasksToSort = [...filteredTasksForDashboard];
    tasksToSort.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "created_at" || sortBy === "updated_at") {
        const dateA = new Date(a[sortBy] || 0).getTime();
        const dateB = new Date(b[sortBy] || 0).getTime();
        comparison = dateA - dateB;
      } else if (sortBy === "status") {
        const statusOrder: Record<string, number> = {
          "TO_DO": 0,
          "IN_PROGRESS": 1,
          "PENDING_INPUT": 2,
          "BLOCKED": 3,
          "COMPLETED": 4,
          "FAILED": 5,
        };
        const statusA = statusOrder[a.status || "TO_DO"];
        const statusB = statusOrder[b.status || "TO_DO"];
        comparison = statusA - statusB;
      }
      // Apply sort direction
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return tasksToSort;
  }, [filteredTasksForDashboard, sortBy, sortDirection]);

  const combinedLoading = isLoadingAll || isLoadingProjects || isLoadingAgents;

  if (isLoadingAll && !initialLoadError) {
    return <DashboardLoading />;
  }

  if (initialLoadError) {
    return <DashboardError message={initialLoadError} />;
  }

  const otherError = projectsError || agentsError;
  if (otherError && !initialLoadError) {
    return (
      <Box
        as="main"
        w="full"
        h="70vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={{ base: 3, md: 6 }}
      >
        <Box role="alert" w="full" maxW="lg" textAlign="center">
          <VStack spacing={4}>
            <WarningTwoIcon w={10} h={10} color="orange.400" />
            <Heading as="h2" size="md">
              Data Loading Issue
            </Heading>
            <Text>There was a problem loading some dashboard components.</Text>
            {projectsError && (
              <Text fontSize="sm" color="red.400">
                Project data error: {projectsError}
              </Text>
            )}
            {agentsError && (
              <Text fontSize="sm" color="red.400">
                Agent data error: {agentsError}
              </Text>
            )}
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      as="main"
      w="full"
      p={{ base: 3, md: 6 }}
      aria-busy={!!combinedLoading && !initialLoadError && !otherError}
    >
      <VStack spacing={sizing.spacing[6] || 6} align="stretch">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack spacing={sizing.spacing[3] || 3} alignItems="center">
            <AppIcon
              component={FaTasks}
              w={sizing.spacing[8] || "32px"}
              h={sizing.spacing[8] || "32px"}
              color="icon.primary"
              mr={sizing.spacing[2] || 2}
              aria-hidden="true"
            />
            <Heading
              as="h1"
              size="xl"
              color={semanticColors.textPrimary?.DEFAULT || "inherit"}
              fontFamily={typography.fontFamily.heading.join(",")}
            >
              Dashboard Overview
            </Heading>
          </HStack>
        </HStack>

        <DashboardStatsGrid stats={overallStats} isLoading={isLoadingAll} />

        {tasksError && !initialLoadError && !otherError && (
          <Box
            role="alert"
            p={sizing.spacing[2]}
            borderWidth="1px"
            borderRadius={sizing.borderRadius.md}
            borderColor={"red.500"}
            bg={"red.100"}
            my={sizing.spacing[2]}
          >
            <Text color={"red.700"} fontSize={typography.fontSize.sm}>
              Note: There was an issue loading some task-related charts/data.{" "}
              {tasksError}
            </Text>
          </Box>
        )}

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={sizing.spacing[6] || 6}
        >
          <DashboardSection
            title="Task Status Distribution"
            isLoading={isLoadingTasks}
            error={tasksError}
          >
            <TaskStatusChart statusCounts={statusCounts} />
          </DashboardSection>
          <DashboardSection
            title="Tasks - Created vs Completed (Last 14 Days)"
            isLoading={isLoadingTasks}
            error={tasksError}
          >
            <TasksOverTimeChart tasksOverTime={tasksOverTime} />
          </DashboardSection>
        </SimpleGrid>

        <DashboardSection
          title="Project Progress"
          isLoading={isLoadingProjects || isLoadingTasks}
          error={projectsError || tasksError}
        >
          <ProjectProgressChart tasksPerProject={tasksPerProject} />
        </DashboardSection>

        <DashboardSection
          title="Agent Workload"
          isLoading={isLoadingAgents || isLoadingTasks}
          error={agentsError || tasksError}
        >
          <AgentWorkloadChart agentWorkload={tasksPerAgent} />
        </DashboardSection>

        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={sizing.spacing[6] || 6}
        >
          <VStack spacing={sizing.spacing[6] || 6} align="stretch">
            {unassignedTasks.length > 0 && (
              <DashboardSection
                title="Unassigned Tasks"
                isLoading={isLoadingTasks}
                error={tasksError}
              >
                <UnassignedTasksList
                  unassignedTasks={unassignedTasks}
                  projects={filteredProjectsForDashboard}
                />
              </DashboardSection>
            )}
          </VStack>

          <DashboardSection
            title="Recent Activity & Top Performers"
            isLoading={isLoadingAgents || isLoadingTasks}
            error={agentsError || tasksError}
          >
            <TopPerformersLists
              topAgents={topAgentsForList}
              topProjects={topProjects}
            />
            <RecentActivityList recentActivity={recentActivity} />
          </DashboardSection>
        </SimpleGrid>

        <DashboardSection
          title="All Tasks"
          isLoading={isLoadingTasks}
          error={tasksError}
        >
          <TaskList tasks={sortedTasks} />
        </DashboardSection>
      </VStack>
    </Box>
  );
};

export default Dashboard;
