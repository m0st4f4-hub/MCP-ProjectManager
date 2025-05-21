// useTaskListState.ts
// Extracted from TaskList.tsx for Dream Level 3 modularization

import { useState, useEffect, useCallback } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/projectStore";
import { useAgentStore } from "@/store/agentStore";
import { useToast, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import { TaskFilters, GroupByType } from "@/types";

export function useTaskListState() {
  // State and selectors
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    isPolling,
    pollingError,
    clearPollingError,
    mutationError,
    clearMutationError,
    sortOptions,
  } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { agents } = useAgentStore();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<GroupByType>("status");
  const [groupBy, setGroupBy] = useState<GroupByType>("status");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const { onOpen: onOpenAddTaskModal } = useDisclosure();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

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
        },
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
        },
      });
    }
  }, [mutationError, toast, clearMutationError]);

  const handleOpenAddTaskModalCallback = useCallback(() => {
    onOpenAddTaskModal();
  }, [onOpenAddTaskModal]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    isPolling,
    pollingError,
    clearPollingError,
    mutationError,
    clearMutationError,
    sortOptions,
    projects,
    fetchProjects,
    agents,
    isInitialLoad,
    setIsInitialLoad,
    viewMode,
    setViewMode,
    groupBy,
    setGroupBy,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    toast,
    isMobile,
    handleOpenAddTaskModalCallback,
  };
} 