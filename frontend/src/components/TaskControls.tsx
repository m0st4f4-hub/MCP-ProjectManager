import React from "react";
import {
  VStack,
  Divider,
  useDisclosure,
  Flex,
  HStack,
  Checkbox,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";

import { GroupByType, ViewMode } from "@/types";
import { TaskStatus } from "@/types/task";
import * as statusUtils from "@/lib/statusUtils";
import { useTaskStore } from "@/store/taskStore";

import ConfirmationModal from "./common/ConfirmationModal";
import BulkActionsBar from "./BulkActionsBar";
import TaskViewControls from "./TaskViewControls";
import TaskFilters from "./task/TaskFilters";
import AppIcon from "./common/AppIcon";
import { sizing, typography } from "../tokens";

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

// List of statuses a user can apply to multiple tasks at once.
// Using enum values ensures type safety across the codebase.
const availableStatusesForBulkUpdate: TaskStatus[] = [
  TaskStatus.TO_DO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
  TaskStatus.BLOCKED,
  TaskStatus.CANCELLED,
];

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
  const selectedTaskIds = useTaskStore((s) => s.selectedTaskIds);
  const selectAllTasks = useTaskStore((s) => s.selectAllTasks);
  const deselectAllTasks = useTaskStore((s) => s.deselectAllTasks);
  const bulkDeleteTasks = useTaskStore((s) => s.bulkDeleteTasks);
  const bulkSetStatusTasks = useTaskStore((s) => s.bulkSetStatusTasks);
  const taskStoreLoading = useTaskStore((s) => s.loading);

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
    e.target.checked
      ? selectAllTasks(allFilterableTaskIds)
      : deselectAllTasks();
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
        <>
          <Divider borderColor="borderDecorative" />
          <Flex justify="space-between" align="center" wrap="wrap" gap="3">
            <HStack spacing="3">
              <AppIcon name="info" color="blue.400" mr={2} />
              <Checkbox
                isChecked={areAllTasksSelected}
                onChange={handleSelectAllToggle}
                isDisabled={allFilterableTaskIds.length === 0}
                colorScheme="brandPrimaryScheme"
                size="sm"
              >
                <Text as="span" ml="2" fontSize={typography.fontSize.sm}>
                  Select All ({allFilterableTaskIds.length})
                </Text>
              </Checkbox>
              {selectedTaskIds.length > 0 && (
                <Text fontSize={typography.fontSize.sm} color="textSecondary">
                  {selectedTaskIds.length} selected
                </Text>
              )}
            </HStack>

            {selectedTaskIds.length > 0 && (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  colorScheme="brandPrimaryScheme"
                  size="sm"
                  rightIcon={<ChevronDownIcon />}
                >
                  Bulk Actions
                </MenuButton>
                <MenuList
                  bg="bgSurface"
                  borderColor="borderDecorative"
                  shadow="md"
                  minW="menu"
                  py="1"
                  zIndex="popover"
                >
                  <MenuItem
                    icon={<DeleteIcon />}
                    color="error"
                    _hover={{ bg: "errorBgSubtle" }}
                    onClick={onDeleteConfirmOpen}
                    isDisabled={taskStoreLoading}
                  >
                    Delete Selected ({selectedTaskIds.length})
                  </MenuItem>
                  <MenuDivider borderColor="borderDecorative" />
                  <MenuItem
                    isDisabled
                    _hover={{ bg: "transparent" }}
                    cursor="default"
                    color="textSecondary"
                  >
                    Set Status to...
                  </MenuItem>
                  {availableStatusesForBulkUpdate.map((statusId) => {
                    const statusAttrs = statusUtils.getStatusAttributes(statusId);
                    const targetStatus = statusAttrs?.id as TaskStatus;
                    return (
                      <MenuItem
                        key={statusId}
                        onClick={() => bulkSetStatusTasks(targetStatus)}
                        pl="8"
                        _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                      >
                        {statusAttrs?.displayName || statusId}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
            )}
          </Flex>
        </>
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
