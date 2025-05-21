// D:\mcp\task-manager\frontend\src\app\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Box, useDisclosure, useToast, useColorMode } from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  SettingsIcon,
  SearchIcon,
  ArrowUpIcon,
  ViewIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import TaskList from "@/components/TaskList";
import ProjectList from "@/components/ProjectList";
import AgentList from "@/components/AgentList";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/projectStore";
import { useAgentStore } from "../store/agentStore";
import { createProject, createAgent } from "../services/api";
import { ProjectCreateData } from "../types/project";
import Dashboard from "../components/Dashboard";
import SettingsContent from "../components/SettingsContent";

import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";
import { ImportPlanModal } from "../components/modals/ImportPlanModal";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import AddTaskModal from "../components/modals/AddTaskModal";
import AddProjectModal from "../components/modals/AddProjectModal";
import AddAgentModal from "../components/modals/AddAgentModal";
import DevToolsDrawer from "../components/modals/DevToolsDrawer";
import FilterPanel from "../components/common/FilterPanel";
import AppIcon from "../components/common/AppIcon";

import type { TaskState } from "../store/taskStore";
import type { ProjectState } from "../store/projectStore";
import type { AgentState } from "../store/agentStore";

import Head from "next/head";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskCreateData } from "../types";

export default function Home() {
  const error = useTaskStore((state: TaskState) => state.error);
  const fetchTasks = useTaskStore((state: TaskState) => state.fetchTasks);
  const startPolling = useTaskStore((state: TaskState) => state.startPolling);
  const stopPolling = useTaskStore((state: TaskState) => state.stopPolling);
  const fetchProjects = useProjectStore(
    (state: ProjectState) => state.fetchProjects,
  );
  const fetchAgents = useAgentStore((state: AgentState) => state.fetchAgents);
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen } = useDisclosure();

  const {
    isOpen: isAddTaskOpen,
    onOpen: onAddTaskOpen,
    onClose: onAddTaskClose,
  } = useDisclosure();
  const {
    isOpen: isAddProjectOpen,
    onOpen: _internalOnAddProjectOpen,
    onClose: onAddProjectClose,
  } = useDisclosure();
  const {
    isOpen: isAddAgentOpen,
    onOpen: onAddAgentOpen,
    onClose: onAddAgentClose,
  } = useDisclosure();
  const {
    isOpen: isImportPlanOpen,
    onOpen: onImportPlanOpen,
    onClose: onImportPlanClose,
  } = useDisclosure();
  const {
    isOpen: isDevToolsOpen,
    onOpen: onOpenDevTools,
    onClose: onCloseDevTools,
  } = useDisclosure();
  const {
    isOpen: isFilterPanelOpen,
    onOpen: onOpenFilterPanel,
    onClose: onCloseFilterPanel,
  } = useDisclosure();

  const projectFilters = useProjectStore((state) => state.filters);
  const setProjectFilters = useProjectStore((state) => state.setFilters);

  const taskFilters = useTaskStore((state) => state.filters);
  const setTaskFilters = useTaskStore((state) => state.setFilters);

  const addTask = useTaskStore((state: TaskState) => state.addTask);

  const onAddProjectOpen = () => {
    _internalOnAddProjectOpen();
  };

  useEffect(() => {
    startPolling();
    fetchAgents();
    fetchProjects();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, fetchAgents, fetchProjects]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  useEffect(() => {}, [
    projectFilters,
    taskFilters,
    setProjectFilters,
    setTaskFilters,
  ]);

  const handleImportSuccess = () => {
    fetchProjects();
    fetchTasks();
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const handleAddTask = async (data: TaskCreateData) => {
    await addTask(data);
    onAddTaskClose();
  };

  const renderContent = () => {
    switch (activeView) {
      case "Dashboard":
        return <Dashboard />;
      case "Workboard":
        return <TaskList />;
      case "Portfolio":
        return <ProjectList />;
      case "Registry":
        return <AgentList />;
      case "Settings":
        return <SettingsContent />;
      default:
        return null;
    }
  };

  const navItems = [
    { view: "Dashboard", label: "Dashboard", icon: <ViewIcon /> },
    { view: "Workboard", label: "Workboard", icon: <EditIcon /> },
    { view: "Portfolio", label: "Portfolio", icon: <SearchIcon /> },
    { view: "Registry", label: "Registry", icon: <TimeIcon /> },
  ];

  const actionNavItems = [
    {
      id: "addTask",
      label: "Add Task",
      icon: <AddIcon />,
      action: onAddTaskOpen,
      showInView: ["Workboard", "Dashboard"],
    },
    {
      id: "addProject",
      label: "Add Project",
      icon: <AddIcon />,
      action: onAddProjectOpen,
      showInView: ["Portfolio", "Dashboard"],
    },
    {
      id: "addAgent",
      label: "Register Agent",
      icon: <AddIcon />,
      action: onAddAgentOpen,
      showInView: ["Registry", "Dashboard"],
    },
    {
      id: "importPlan",
      label: "Import Plan",
      icon: <ArrowUpIcon />,
      action: onImportPlanOpen,
    },
  ];

  const utilityNavItems = [
    {
      id: "filters",
      label: "Filters & Sort",
      icon: <AppIcon name="settings" />,
      action: onOpenFilterPanel,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon />,
      action: () => setActiveView("Settings"),
    },
    {
      id: "devTools",
      label: "Dev Tools",
      icon: <SettingsIcon />,
      action: onOpenDevTools,
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <Head>
        <title>MCP Task Manager</title>
        <meta name="description" content="Managed by MCP Agent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box display="flex" minH="100vh">
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          activeView={activeView}
          setActiveView={setActiveView}
          navItems={navItems}
          actionNavItems={actionNavItems}
          utilityNavItems={utilityNavItems}
        />
        <MainContent
          isSidebarCollapsed={isSidebarCollapsed}
          activeView={activeView}
          renderContent={renderContent}
          isDrawerOpen={isDrawerOpen}
          onDrawerOpen={onDrawerOpen}
        />

        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={onAddTaskClose}
          onAdd={handleAddTask}
        />
        <AddProjectModal
          isOpen={isAddProjectOpen}
          onClose={onAddProjectClose}
          onSubmit={async (data: ProjectCreateData) => {
            await createProject(data);
            fetchProjects();
            onAddProjectClose();
          }}
        />
        <AddAgentModal
          isOpen={isAddAgentOpen}
          onClose={onAddAgentClose}
          onSubmit={async (name: string) => {
            if (!name.trim()) {
              console.error("Agent name cannot be empty.");
              return;
            }
            try {
              await createAgent(name);
              fetchAgents();
              onAddAgentClose();
            } catch (error) {
              console.error("Failed to create agent:", error);
            }
          }}
        />
        <ImportPlanModal
          isOpen={isImportPlanOpen}
          onClose={onImportPlanClose}
          onImportSuccess={handleImportSuccess}
        />
        <CreateProjectModal
          isOpen={isAddProjectOpen}
          onClose={onAddProjectClose}
          onProjectCreated={handleProjectCreated}
        />
        <DevToolsDrawer
          isOpen={isDevToolsOpen}
          onClose={onCloseDevTools}
          colorMode={colorMode}
        />
        <FilterPanel isOpen={isFilterPanelOpen} onClose={onCloseFilterPanel} />
      </Box>
    </DndProvider>
  );
}
