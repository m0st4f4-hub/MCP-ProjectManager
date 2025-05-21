// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Box,
  // VStack, // Unused import
  Text,
  // Alert, // Unused import
  // AlertIcon, // Unused import
  // AlertTitle, // Unused import
  // AlertDescription, // Unused import
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  // Icon, // Unused import
} from "@chakra-ui/react";
import { useTaskStore } from "@/store/taskStore";
import { Task, GroupByType } from "@/types";
// import AddTaskForm from './forms/AddTaskForm'; // Removed unused import
// Icons are no longer directly used by TaskList:
// import { AddIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import ListView from "./views/ListView";
import TaskControls from "./TaskControls";
import NoTasks from "./NoTasks"; // Import the new component
import TaskLoading from "./TaskLoading"; // Import the new component
import TaskError from "./TaskError"; // Import the new component
import KanbanView from "./views/KanbanView"; // Import KanbanView
// import styles from './TaskList.module.css'; // Added import for CSS Modules
// import TaskItem from './TaskItem'; // Unused import
import {
  applyAllFilters,
  groupTasksByStatus,
} from "./TaskList.utils";

type ViewMode = "list" | "kanban";
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
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchProjectsAndAgents = useTaskStore(
    (state) => state.fetchProjectsAndAgents,
  );
  const sortOptions = useTaskStore((state) => state.sortOptions);
  // const deleteTask = useTaskStore(state => state.deleteTask); // Unused - keep commented or remove
  const isPolling = useTaskStore((state) => state.isPolling);
  const pollingError = useTaskStore((state) => state.pollingError);
  const clearPollingError = useTaskStore((state) => state.clearPollingError);
  const mutationError = useTaskStore((state) => state.mutationError);
  const clearMutationError = useTaskStore((state) => state.clearMutationError);
  const filters = useTaskStore((state) => state.filters);

  const [, setGroupBy] = useState<GroupByType>("status"); // groupBy is set but not used
  const {
    isOpen: isAddTaskModalOpen,
    onOpen: onOpenAddTaskModal,
    onClose: onCloseAddTaskModal,
  } = useDisclosure();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const {} = useDisclosure(); // isFilterOpen and onFilterOpen are unused, onFilterClose was removed previously

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

  const handleOpenAddTaskModalCallback = useCallback(
    (/* taskToEdit: Task | null = null */) => {
      // taskToEdit is unused
      // setEditingTask(taskToEdit); // This line was already commented out or removed
      onOpenAddTaskModal();
    },
    [onOpenAddTaskModal],
  ); // Removed setParentTaskForNewTask from dependencies

  const allFilterableTasks = useMemo(() => {
    return tasks.filter((task) => applyAllFilters(task, filters));
  }, [tasks, filters]);

  const allFilterableTaskIds = useMemo(
    () => allFilterableTasks.map((t) => t.id),
    [allFilterableTasks],
  );

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
  const effectiveGroupBy = viewMode === "kanban" ? "status" : "status";

  const groupedAndFilteredTasks: GroupedTasks = useMemo(() => {
    const topLevelTasks = filteredTasksForListView;

    return groupTasksByStatus(topLevelTasks, sortOptions);
  }, [
    filteredTasksForListView,
    sortOptions,
  ]);

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

  const noTasksToShow =
    groupedAndFilteredTasks.groups.every((group) => {
      if (group.tasks?.length) return false;
      if (group.subgroups?.every((sub) => !sub.tasks.length)) return true;
      if (
        group.subgroups &&
        group.subgroups.length > 0 &&
        !group.subgroups.some((sub) => sub.tasks.length > 0)
      )
        return true;
      if (!group.tasks && !group.subgroups) return true;
      return false;
    }) &&
    !loading &&
    !isInitialLoad;

  if (noTasksToShow) {
    return <NoTasks onAddTask={() => handleOpenAddTaskModalCallback()} />;
  }

  return (
    <Box>
      <TaskControls
        groupBy={effectiveGroupBy}
        setGroupBy={(value: GroupByType) => setGroupBy(value)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isPolling={isPolling}
        allFilterableTaskIds={allFilterableTaskIds}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* <Heading size="lg" mb={6} color="text.heading">Tasks</Heading> */}

      {/* Conditional Rendering based on viewMode */}
      {viewMode === "list" && (
        <ListView
          groupedTasks={groupedAndFilteredTasks}
          isLoading={loading && isInitialLoad}
          isMobile={isMobile}
        />
      )}
      {viewMode === "kanban" && (
        <KanbanView
          filteredTasks={tasksForKanbanView}
          // onOpenModal={handleOpenAddTaskModalCallback} // If needed later for Kanban
          compactView={isMobile} // Or a specific compact state for Kanban
        />
      )}

      {(!loading || !isInitialLoad) && tasks.length === 0 && (
        <NoTasks onAddTask={handleOpenAddTaskModalCallback} />
      )}

      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={onCloseAddTaskModal}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody pb={6} pt={8}>
            {/* If AddTaskForm was used here, this will need adjustment */}
            {/* For now, assuming AddTaskForm is not used inside this modal based on the error */}
            <Text>Add task functionality might be here.</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TaskList;
