import React from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  List,
} from "@chakra-ui/react";
import { typography } from "../../tokens";
import AppIcon from "@/components/common/AppIcon";
import ListTaskItem from "./ListTaskItem";
import { Task } from "@/types/task";

interface TaskSubgroup {
  id: string;
  name: string;
  tasks: Task[];
  status?: string;
}

interface ListSubgroupProps {
  subgroup: TaskSubgroup;
  groupId: string;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  handleAssignAgent: (task: Task) => void;
  handleDeleteInitiate: (task: Task) => void;
  setSelectedTask: (task: Task) => void;
  handleCopyTaskGetCommand: (taskId: string) => void;
}

const ListSubgroup: React.FC<ListSubgroupProps> = ({
  subgroup,
  groupId,
  expandedGroups,
  toggleGroup,
  selectedTaskIds,
  toggleTaskSelection,
  handleAssignAgent,
  handleDeleteInitiate,
  setSelectedTask,
  handleCopyTaskGetCommand,
}) => {
  const subgroupKey = `${groupId}-${subgroup.id}`;
  return (
    <Box>
      <Flex
        alignItems="center"
        p="2"
        pl="8"
        cursor="pointer"
        borderBottomWidth="DEFAULT"
        borderBottomStyle="solid"
        borderColor="borderDecorative"
        onClick={() => toggleGroup(subgroupKey)}
        _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
      >
        <IconButton
          aria-label={
            expandedGroups[subgroupKey]
              ? "Collapse subgroup"
              : "Expand subgroup"
          }
          icon={
            <AppIcon
              name={
                expandedGroups[subgroupKey]
                  ? "chevrondown"
                  : "chevronright"
              }
            />
          }
          size="xs"
          variant="ghost"
          mr="1"
        />
        <Text
          ml="2"
          fontWeight={typography.fontWeight.regular}
          color="textSecondary"
        >
          {subgroup.name} ({subgroup.tasks.length})
        </Text>
      </Flex>
      {expandedGroups[subgroupKey] && (
        <List spacing={0} pl="4">
          {subgroup.tasks.map((task) => (
            <ListTaskItem
              key={task.id}
              task={task}
              selectedTaskIds={selectedTaskIds}
              toggleTaskSelection={toggleTaskSelection}
              handleAssignAgent={handleAssignAgent}
              handleDeleteInitiate={handleDeleteInitiate}
              setSelectedTask={setSelectedTask}
              handleCopyTaskGetCommand={handleCopyTaskGetCommand}
            />
          ))}
        </List>
      )}
    </Box>
  );
};

export default ListSubgroup; 