import React from "react";
import {
  ViewIcon,
  ViewOffIcon,
  ChevronDownIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import {
  Flex,
  HStack,
  VStack,
  Checkbox,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Select,
  Spinner,
  Divider,
  Text,
  useDisclosure,
  FormLabel,
} from "@chakra-ui/react";
import { GroupByType, ViewMode } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import * as statusUtils from "@/lib/statusUtils";
import ConfirmationModal from "./common/ConfirmationModal";
import AppIcon from "./common/AppIcon";
import { sizing, typography } from "../tokens";
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

  const availableStatusesForBulkUpdate = React.useMemo(() => {
    return statusUtils.getAllStatusIds().filter((id) => {
      const attrs = statusUtils.getStatusAttributes(id);
      return !attrs?.isTerminal && !attrs?.isDynamic;
    });
  }, []);

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
                    isDisabled={true}
                    _hover={{ bg: "transparent" }}
                    cursor="default"
                    color="textSecondary"
                  >
                    Set Status to...
                  </MenuItem>
                  {availableStatusesForBulkUpdate.map((statusId) => {
                    const statusAttrs =
                      statusUtils.getStatusAttributes(statusId);
                    return (
                      <MenuItem
                        key={statusId}
                        onClick={() => bulkSetStatusTasks(statusId)}
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

      <Flex
        justify="space-between"
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        gap={{ base: "3", md: "4" }}
        mt={!showBulkActionsBar ? `-${sizing.spacing[4]}` : undefined}
      >
        <HStack
          align="center"
          wrap="wrap"
          w={{ base: "full", md: "auto" }}
          gap={{ base: "2", md: "3" }}
          spacing={{ base: 0, md: 3 }}
        >
          {isPolling && <Spinner size="sm" color="primary" />}
          {!hideGroupBy && (
            <Flex align="center" gap="2">
              <FormLabel
                htmlFor="task-group-by-select"
                mb="0"
                fontSize={typography.fontSize.sm}
                color="textSecondary"
                whiteSpace="nowrap"
              >
                Group:
              </FormLabel>
              <Select
                id="task-group-by-select"
                aria-label="Group by"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                size="sm"
                w={{ base: "auto", md: "130px" }}
                focusBorderColor="borderFocused"
                bg="surface"
                borderColor="borderInteractive"
                _hover={{ borderColor: "borderFocused" }}
              >
                <option
                  value="title"
                  className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
                >
                  Title
                </option>
                <option
                  value="status"
                  className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
                >
                  Status
                </option>
                <option
                  value="project"
                  className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
                >
                  Project
                </option>
                <option
                  value="agent"
                  className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
                >
                  Agent
                </option>
                <option
                  value="createdAt"
                  className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
                >
                  Creation Date
                </option>
                <option
                  value="updatedAt"
                  className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
                >
                  Last Updated
                </option>
              </Select>
            </Flex>
          )}
        </HStack>

        <HStack
          wrap="nowrap"
          w={{ base: "full", md: "auto" }}
          justify={{ base: "space-between", md: "flex-end" }}
          gap={{ base: "2", md: "3" }}
          spacing={{ base: 0, md: 3 }}
        >
          <Button
            variant="outline"
            colorScheme="brandSecondaryScheme"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "kanban" ? "list" : "kanban")
            }
            aria-label={
              viewMode === "kanban"
                ? "Switch to List View"
                : "Switch to Kanban View"
            }
            leftIcon={viewMode === "kanban" ? <ViewIcon /> : <ViewOffIcon />}
          >
            {viewMode === "kanban" ? "List View" : "Kanban View"}
          </Button>
        </HStack>
      </Flex>

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

      <TaskFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Group By Select */}
      {/* {!hideGroupBy && (
        <HStack spacing={sizing.sm} alignItems="center">
          <FormLabel htmlFor="task-group-by-select" mb="0">
            Group by:
          </FormLabel>
          <Select
            id="task-group-by-select"
            aria-label="Group by"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByType)}
            size="sm"
            w={{ base: "auto", md: "130px" }}
            focusBorderColor="borderFocused"
            bg="surface"
            borderColor="borderInteractive"
            _hover={{ borderColor: "borderFocused" }}
          >
            <option
              value="id"
              className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
            >
              ID
            </option>
            <option
              value="title"
              className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
            >
              Title
            </option>
            <option
              value="status"
              className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
            >
              Status
            </option>
            <option
              value="project"
              className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
            >
              Project
            </option>
            <option
              value="agent"
              className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
            >
              Agent
            </option>
            <option
              value="createdAt"
              className="bg-surface dark:bg-surface text-textPrimary dark:text-textPrimary"
            >
              Creation Date
            </option>
          </Select>
        </HStack>
      )} */}

      {/* View Mode Toggle */}
    </VStack>
  );
};

export default TaskControls;
