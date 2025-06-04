import React from "react";
import {
  Flex,
  HStack,
  Select,
  FormLabel,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { GroupByType, ViewMode } from "@/types";
import { typography } from "../tokens";

interface TaskViewControlsProps {
  groupBy: GroupByType;
  setGroupBy: (value: GroupByType) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  hideGroupBy?: boolean;
  isPolling?: boolean;
}

const TaskViewControls: React.FC<TaskViewControlsProps> = ({
  groupBy,
  setGroupBy,
  viewMode,
  setViewMode,
  hideGroupBy = false,
  isPolling = false,
}) => (
  <Flex
    justify="space-between"
    direction={{ base: "column", md: "row" }}
    align={{ base: "stretch", md: "center" }}
    gap={{ base: "3", md: "4" }}
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
        onClick={() => setViewMode(viewMode === "kanban" ? "list" : "kanban")}
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
);

export default TaskViewControls;
