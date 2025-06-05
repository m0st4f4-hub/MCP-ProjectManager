"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useBreakpointValue,
  useDisclosure,
  useToast,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { useTaskStore } from "@/store/taskStore";
import { Task, GroupByType } from "@/types";
import type { GroupedTasks } from "./views/ListView.types";

import TaskControls from "./TaskControls";
import ListView from "./views/ListView";
import KanbanView from "./views/KanbanView";
import TaskLoading from "./TaskLoading";
import TaskError from "./TaskError";
import NoTasks from "./NoTasks";
import TaskPagination from "./task/TaskPagination";

import { applyAllFilters, groupTasksByStatus } from "./TaskList.utils";

type ViewMode = "list" | "kanban";

const TaskList: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchProjectsAndAgents = useTaskStore((state) => state.fetchProjectsAndAgents);
  const sortOptions = useTaskStore((state) => state.sortOptions);
  const isPolling = useTaskStore((state) => state.isPolling);
  const pollingError = useTaskStore((state) => state.pollingError);
  const clearPollingError = useTaskStore((state) => state.clearPollingError);
  const mutationError = useTaskStore((state) => state.mutationError);
  const clearMutationError = useTaskStore((state) => state.clearMutationError);
  const filters = useTaskStore((state) => state.filters);

  const [groupBy, setGroupBy] = useState<GroupByType>("status");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const {
    isOpen: isAddTaskModalOpen,
    onOpen: onOpenAddTaskModal,
    onClose: onCloseAddTaskModal,
  } = useDisclosure();

  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

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
        onCloseComplete: clearPollingError,
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
        onCloseComplete: clearMutationError,
      });
    }
  }, [mutationError, toast, clearMutationError]);

  const handleOpenAddTaskModalCallback = useCallback(() => {
    onOpenAddTaskModal();
  }, [onOpenAddTaskModal]);

  const allFilterableTasks = useMemo(() => {
    return tasks.filter((task) => applyAllFilters(task, filters));
  }, [tasks, filters]);

  const allFilterableTaskIds = useMemo(
    () => allFilterableTasks.map((t) => `${t.project_id}-${t.task_number}`),
    [allFilterableTasks]
  );

  const groupedAndFilteredTasks: GroupedTasks = useMemo(() => {
    return groupTasksByStatus(allFilterableTasks, sortOptions);
  }, [allFilterableTasks, sortOptions]);

  const paginatedTasks = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return allFilterableTasks.slice(start, start + itemsPerPage);
  }, [allFilterableTasks, currentPage, itemsPerPage]);

  const noTasksToShow = !loading && !isInitialLoad && allFilterableTasks.length === 0;

  if (loading && isInitialLoad) {
    return <TaskLoading />;
  }

  if (error) {
    return (
      <TaskError
        error={typeof error === "string" ? error : String(error)}
        onRetry={fetchTasks}
      />
    );
  }

  if (noTasksToShow) {
    return <NoTasks onAddTask={handleOpenAddTaskModalCallback} />;
  }

  return (
    <Box>
      <TaskControls
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isPolling={isPolling}
        allFilterableTaskIds={allFilterableTaskIds}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {viewMode === "list" && (
        <ListView
          groupedTasks={groupedAndFilteredTasks}
          isLoading={loading && isInitialLoad}
          isMobile={isMobile}
        />
      )}

      {viewMode === "kanban" && (
        <KanbanView
          filteredTasks={paginatedTasks}
          compactView={isMobile}
        />
      )}

      <TaskPagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={allFilterableTasks.length}
        onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() =>
          setCurrentPage((p) =>
            Math.min(Math.ceil(allFilterableTasks.length / itemsPerPage) - 1, p + 1)
          )
        }
      />

      <Modal isOpen={isAddTaskModalOpen} onClose={onCloseAddTaskModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody pb={6} pt={8}>
            <Text>Add task functionality might be here.</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TaskList;
