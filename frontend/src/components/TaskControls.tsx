import React from "react";
import { VStack, Divider, useDisclosure } from "@chakra-ui/react";
import { GroupByType, ViewMode } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import ConfirmationModal from "./common/ConfirmationModal";
import BulkActionsBar from "./BulkActionsBar";
import TaskViewControls from "./TaskViewControls";
import TaskFilters from "./task/TaskFilters";

interface TaskControlsProps {
  groupBy: GroupByType;
  setGroupBy: (value: GroupByType) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  hideGroupBy?: boolean;
  isPolling?: boolean;
  allFilterableTaskIds: string[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const TaskControls: React.FC<TaskControlsProps> = ({
  groupBy,
  setGroupBy,
  viewMode,
  setViewMode,
  hideGroupBy = false,
  isPolling = false,
  allFilterableTaskIds,
  searchTerm,
  setSearchTerm,
}) => {
  const selectedTaskIds = useTaskStore((state) => state.selectedTaskIds);
  const selectAllTasks = useTaskStore((state) => state.selectAllTasks);
  const deselectAllTasks = useTaskStore((state) => state.deselectAllTasks);
  const bulkDeleteTasks = useTaskStore((state) => state.bulkDeleteTasks);
  const bulkSetStatusTasks = useTaskStore((state) => state.bulkSetStatusTasks);
  const taskStoreLoading = useTaskStore((state) => state.loading);

  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();

  const areAllTasksSelected = React.useMemo(() => {
    if (allFilterableTaskIds.length === 0) return false;
    return allFilterableTaskIds.every((id) => selectedTaskIds.includes(id));
  }, [selectedTaskIds, allFilterableTaskIds]);

  const handleSelectAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectAllTasks(allFilterableTaskIds);
    } else {
      deselectAllTasks();
    }
  };

  const handleBulkDeleteConfirm = async () => {
    await bulkDeleteTasks();
    onDeleteConfirmClose();
  };

  const showBulkActionsBar =
    selectedTaskIds.length > 0 || allFilterableTaskIds.length > 0;

  return (
    <VStack
      spacing="5"
      mb="6"
      bg="bgSurface"
      p="4"
      rounded="lg"
      borderWidth="DEFAULT"
      borderColor="borderDecorative"
      align="stretch"
    >
      {showBulkActionsBar && (
        <BulkActionsBar
          selectedTaskIds={selectedTaskIds}
          allFilterableTaskIds={allFilterableTaskIds}
          areAllTasksSelected={areAllTasksSelected}
          onSelectAllToggle={handleSelectAllToggle}
          onDeleteSelected={onDeleteConfirmOpen}
          bulkSetStatusTasks={bulkSetStatusTasks}
          loading={taskStoreLoading}
        />
      )}

      <Divider borderColor="borderDecorative" />

      <TaskViewControls
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        hideGroupBy={hideGroupBy}
        isPolling={isPolling}
      />

      <TaskFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        onConfirm={handleBulkDeleteConfirm}
        title="Confirm Bulk Delete"
        bodyText={`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)? This action cannot be undone.`}
        confirmButtonText="Delete Tasks"
        confirmButtonColorScheme="red"
        isLoading={taskStoreLoading}
      />
    </VStack>
  );
};

export default TaskControls;
