"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  useDisclosure,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

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
import { useTaskListState } from "./useTaskListState";

type ViewMode = "list" | "kanban";

const TaskList: React.FC = () => {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    sortOptions,
    isPolling,
    filters,
    groupBy,
    setGroupBy,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    isInitialLoad,
    isMobile,
  } = useTaskListState();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const {
    isOpen: isAddTaskModalOpen,
    onOpen: onOpenAddTaskModal,
    onClose: onCloseAddTaskModal,
  } = useDisclosure();

  // Initial fetches and toast handling are performed within useTaskListState

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
        <ModalOverlay bg="overlayDefault" />
        <ModalContent bg="bgModal">
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
