"use client";

import React from "react";
import { VStack, SimpleGrid, Box, Text } from "@chakra-ui/react";
import DashboardStatsGrid from "./DashboardStatsGrid";
import DashboardSection from "./DashboardSection";
import TaskStatusChart from "./TaskStatusChart";
import TasksOverTimeChart from "./TasksOverTimeChart";
import ProjectProgressChart from "./ProjectProgressChart";
import AgentWorkloadChart from "./AgentWorkloadChart";
import TaskList from "../TaskList";

interface StatusCount {
  name: string;
  value: number;
  color: string;
}

interface TasksOverTime {
  date: string;
  created: number;
  completed: number;
}

interface TasksPerProject {
  name: string;
  value: number;
  color: string;
  progress: number;
}

interface TasksPerAgent {
  name: string;
  tasks: number;
  color: string;
}

interface DashboardViewsProps {
  overallStats: any[];
  isLoadingAll: boolean;
  tasksError: string | null;
  otherError: string | null;
  isLoadingTasks: boolean;
  statusCounts: StatusCount[];
  tasksOverTime: TasksOverTime[];
  tasksPerProject: TasksPerProject[];
  tasksPerAgent: TasksPerAgent[];
  isLoadingProjects: boolean;
  isLoadingAgents: boolean;
  projectsError: string | null;
  agentsError: string | null;
}

const DashboardViews: React.FC<DashboardViewsProps> = ({
  overallStats,
  isLoadingAll,
  tasksError,
  otherError,
  isLoadingTasks,
  statusCounts,
  tasksOverTime,
  tasksPerProject,
  tasksPerAgent,
  isLoadingProjects,
  isLoadingAgents,
  projectsError,
  agentsError,
}) => (
  <VStack spacing={6} align="stretch">
    <DashboardStatsGrid stats={overallStats} isLoading={isLoadingAll} />

    {tasksError && !otherError && (
      <Box
        role="alert"
        p={2}
        borderWidth="1px"
        borderRadius="md"
        borderColor="red.500"
        bg="red.100"
      >
        <Text color="red.700" fontSize="sm">
          Note: There was an issue loading some task-related charts/data. {tasksError}
        </Text>
      </Box>
    )}

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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

    <DashboardSection
      title="All Tasks"
      isLoading={isLoadingTasks}
      error={tasksError}
    >
      <TaskList />
    </DashboardSection>
  </VStack>
);

export default DashboardViews;
