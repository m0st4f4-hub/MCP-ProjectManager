"use client";

import React from "react";
import { VStack, SimpleGrid } from "@chakra-ui/react";
import DashboardSection from "./DashboardSection";
import UnassignedTasksList from "./UnassignedTasksList";
import TopPerformersLists from "./TopPerformersLists";
import RecentActivityList from "./RecentActivityList";
import { Task } from "@/types/task";
import { Project } from "@/types/project";

interface DashboardSidebarProps {
  unassignedTasks: Task[];
  projects: Project[];
  topAgents: { name: string; value: number }[];
  topProjects: { name: string; value: number }[];
  recentActivity: {
    type: string;
    title: string;
    date: string | undefined;
    agent?: string | undefined;
    project?: string | undefined;
  }[];
  isLoadingTasks: boolean;
  tasksError: string | null;
  isLoadingAgents: boolean;
  agentsError: string | null;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  unassignedTasks,
  projects,
  topAgents,
  topProjects,
  recentActivity,
  isLoadingTasks,
  tasksError,
  isLoadingAgents,
  agentsError,
}) => (
  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
    <VStack spacing={6} align="stretch">
      {unassignedTasks.length > 0 && (
        <DashboardSection
          title="Unassigned Tasks"
          isLoading={isLoadingTasks}
          error={tasksError}
        >
          <UnassignedTasksList
            unassignedTasks={unassignedTasks}
            projects={projects}
          />
        </DashboardSection>
      )}
    </VStack>

    <DashboardSection
      title="Recent Activity & Top Performers"
      isLoading={isLoadingAgents || isLoadingTasks}
      error={agentsError || tasksError}
    >
      <TopPerformersLists topAgents={topAgents} topProjects={topProjects} />
      <RecentActivityList recentActivity={recentActivity} />
    </DashboardSection>
  </SimpleGrid>
);

export default DashboardSidebar;
