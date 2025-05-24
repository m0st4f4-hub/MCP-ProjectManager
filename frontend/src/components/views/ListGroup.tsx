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
import type { TaskGroup } from "./ListView.types";
import ListSubgroup from "./ListSubgroup";
import ListTaskItem from "./ListTaskItem";
import { Task } from "@/types";

interface ListGroupProps {
  group: TaskGroup;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  handleAssignAgent: (task: Task) => void;
  handleDeleteInitiate: (task: Task) => void;
  setSelectedTask: (task: Task) => void;
  handleCopyTaskGetCommand: (taskId: string) => void;
  isMobile?: boolean;
}

const ListGroup: React.FC<ListGroupProps> = ({
  group,
  expandedGroups,
  toggleGroup,
  selectedTaskIds,
  toggleTaskSelection,
  handleAssignAgent,
  handleDeleteInitiate,
  setSelectedTask,
  handleCopyTaskGetCommand,
}) => {
  return (
    <Box mb={4}>
      <Flex
        alignItems="center"
        p="3"
        cursor="pointer"
        borderBottomWidth="DEFAULT"
        borderBottomStyle="solid"
        borderColor="borderDecorative"
        onClick={() => toggleGroup(group.id)}
        _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
      >
        <IconButton
          aria-label={
            expandedGroups[group.id] ? "Collapse group" : "Expand group"
          }
          icon={
            <AppIcon
              name={expandedGroups[group.id] ? "chevrondown" : "chevronright"}
            />
          }
          size="sm"
          variant="ghost"
        />
        <Text
          ml="2"
          fontWeight={typography.fontWeight.medium}
          color="textPrimary"
        >
          {group.name} (
          {group.tasks?.length ||
            group.subgroups?.reduce((acc, sg) => acc + sg.tasks.length, 0) ||
            0}
          )
        </Text>
      </Flex>
      {expandedGroups[group.id] && (
        <List spacing={0}>
          {group.tasks?.map((task) => (
            <ListTaskItem
              key={`${task.project_id}-${task.task_number}`}
              task={task}
              selectedTaskIds={selectedTaskIds}
              toggleTaskSelection={toggleTaskSelection}
              handleAssignAgent={handleAssignAgent}
              handleDeleteInitiate={handleDeleteInitiate}
              setSelectedTask={setSelectedTask}
              handleCopyTaskGetCommand={handleCopyTaskGetCommand}
            />
          ))}
          {group.subgroups?.map((subgroup) => (
            <ListSubgroup
              key={subgroup.id}
              subgroup={subgroup}
              groupId={group.id}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
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

export default ListGroup; 