import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  IconButton,
  useToast,
  List,
  ListItem,
  ModalFooter,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  Box,
  Flex,
  Text,
  CopyIcon as ChakraCopyIcon,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { Task, Agent } from "@/types";
import { useAgentStore } from "@/store/agentStore";
import { useTaskStore } from "@/store/taskStore";
import EditTaskModal from "../modals/EditTaskModal";
import TaskItem from "../TaskItem";
import TaskDetailsModal from "../modals/TaskDetailsModal";
import { AgentState } from "@/store/agentStore";
import { TaskState } from "@/store/taskStore";
import AppIcon from "../common/AppIcon";
import { typography } from '../../tokens';
import { sizing } from '../../tokens';

type GroupByType = "status" | "project" | "agent" | "parent";

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

interface ListViewProps {
  groupedTasks: GroupedTasks;
  isLoading: boolean;
  isMobile: boolean;
}

const ListView: React.FC<ListViewProps> = ({
  groupedTasks,
  isLoading,
  isMobile,
}) => {
  const agents = useAgentStore((state: AgentState) => state.agents);
  const deleteTaskFromStore = useTaskStore(
    (state: TaskState) => state.deleteTask,
  );
  const editTaskInStore = useTaskStore((state: TaskState) => state.updateTask);
  const selectedTaskIds = useTaskStore(
    (state: TaskState) => state.selectedTaskIds,
  );
  const toggleTaskSelection = useTaskStore(
    (state: TaskState) => state.toggleTaskSelection,
  );
  const toast = useToast();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [assignAgentTask, setAssignAgentTask] = useState<Task | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const initialExpansionState: Record<string, boolean> = {};
    groupedTasks.groups.forEach((group) => {
      initialExpansionState[group.id] = true;
      if (group.subgroups) {
        group.subgroups.forEach((subgroup) => {
          initialExpansionState[`${group.id}-${subgroup.id}`] = true;
        });
      }
    });
    setExpandedGroups(initialExpansionState);
  }, [groupedTasks]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={sizing.spacing['5']}
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  const handleDeleteInitiateInListView = (task: Task) => {
    setTaskToDelete(task);
    onAlertOpen();
  };

  const handleDeleteConfirmInListView = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskFromStore(taskToDelete.id);
      toast({
        title: taskToDelete.is_archived
          ? "Archived task permanently deleted"
          : "Task deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description:
          error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setTaskToDelete(null);
    onAlertClose();
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAssignAgent = (task: Task) => {
    setAssignAgentTask(task);
  };

  const handleAgentSelect = async (agent: Agent) => {
    if (!assignAgentTask) return;
    setAgentLoading(true);
    try {
      await editTaskInStore(assignAgentTask.id, {
        agent_id: agent.id,
        agent_name: agent.name,
      });
      toast({
        title: `Agent assigned: ${agent.name}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to assign agent",
        description: String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAgentLoading(false);
      setAssignAgentTask(null);
    }
  };

  const handleCopyTaskGetCommand = async (taskId: string) => {
    const command = `mcp task get --id ${taskId}`;
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "Task 'get' command copied!",
        description: command,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy command",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isMobile) {
    const flatTasksForMobile = groupedTasks.groups.reduce(
      (acc: Task[], group) => {
        if (group.tasks) {
          acc.push(...group.tasks);
        } else if (group.subgroups) {
          group.subgroups.forEach((sub) => acc.push(...sub.tasks));
        }
        return acc;
      },
      [] as Task[],
    );

    return (
      <List spacing={0}>
        <AnimatePresence initial={false}>
          {flatTasksForMobile.map((task) => (
            <ListItem
              key={task.id}
              display="flex"
              alignItems="center"
              py="2"
              px="2"
              borderBottomWidth="DEFAULT"
              borderBottomStyle="solid"
              borderColor="borderDecorative"
              bg={
                selectedTaskIds.includes(task.id)
                  ? "surfaceElevated"
                  : "transparent"
              }
            >
              <Checkbox
                isChecked={selectedTaskIds.includes(task.id)}
                onChange={() => toggleTaskSelection(task.id)}
                mr="3"
                colorScheme="blue"
                aria-label={`Select task ${task.title}`}
              />
              <Box flex={1}>
                <TaskItem
                  task={task}
                  onAssignAgent={handleAssignAgent}
                  onDeleteInitiate={handleDeleteInitiateInListView}
                  onClick={() => setSelectedTask(task)}
                  onCopyGetCommand={handleCopyTaskGetCommand}
                />
              </Box>
            </ListItem>
          ))}
        </AnimatePresence>
      </List>
    );
  }

  return (
    <>
      <Box pt="4" pb="4">
        {groupedTasks.groups.map((group) => (
          <Box key={group.id} mb={4}>
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
                    name={
                      expandedGroups[group.id] ? "chevrondown" : "chevronright"
                    }
                  />
                }
                size="sm"
                variant="ghost"
              />
              <Text ml="2" fontWeight={typography.fontWeight.medium} color="textPrimary">
                {group.name} (
                {group.tasks?.length ||
                  group.subgroups?.reduce(
                    (acc, sg) => acc + sg.tasks.length,
                    0,
                  ) ||
                  0}
                )
              </Text>
            </Flex>
            {expandedGroups[group.id] && (
              <List spacing={0}>
                {group.tasks?.map((task) => (
                  <ListItem
                    key={task.id}
                    display="flex"
                    alignItems="center"
                    pl="10"
                    pr="2"
                    py="1"
                    borderBottomWidth="DEFAULT"
                    borderBottomStyle="solid"
                    borderColor="borderDecorative"
                    bg={
                      selectedTaskIds.includes(task.id)
                        ? "surfaceElevated"
                        : "transparent"
                    }
                    _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
                  >
                    <Checkbox
                      isChecked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      mr="3"
                      aria-label={`Select task ${task.title}`}
                      colorScheme="blue"
                    />
                    <Box flex={1}>
                      <TaskItem
                        task={task}
                        onAssignAgent={handleAssignAgent}
                        onDeleteInitiate={handleDeleteInitiateInListView}
                        onClick={() => setSelectedTask(task)}
                        onCopyGetCommand={handleCopyTaskGetCommand}
                      />
                    </Box>
                  </ListItem>
                ))}
                {group.subgroups?.map((subgroup) => (
                  <Box key={subgroup.id}>
                    <Flex
                      alignItems="center"
                      p="2"
                      pl="8"
                      cursor="pointer"
                      borderBottomWidth="DEFAULT"
                      borderBottomStyle="solid"
                      borderColor="borderDecorative"
                      onClick={() => toggleGroup(`${group.id}-${subgroup.id}`)}
                      _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
                    >
                      <IconButton
                        aria-label={
                          expandedGroups[`${group.id}-${subgroup.id}`]
                            ? "Collapse subgroup"
                            : "Expand subgroup"
                        }
                        icon={
                          <AppIcon
                            name={
                              expandedGroups[`${group.id}-${subgroup.id}`]
                                ? "chevrondown"
                                : "chevronright"
                            }
                          />
                        }
                        size="xs"
                        variant="ghost"
                        mr="1"
                      />
                      <Text ml="2" fontWeight={typography.fontWeight.regular} color="textSecondary">
                        {subgroup.name} ({subgroup.tasks.length})
                      </Text>
                    </Flex>
                    {expandedGroups[`${group.id}-${subgroup.id}`] && (
                      <List spacing={0} pl="4">
                        {subgroup.tasks.map((task) => (
                          <ListItem
                            key={task.id}
                            display="flex"
                            alignItems="center"
                            pl="10"
                            pr="2"
                            py="1"
                            borderBottomWidth="DEFAULT"
                            borderBottomStyle="solid"
                            borderColor="borderDecorative"
                            bg={
                              selectedTaskIds.includes(task.id)
                                ? "surfaceElevated"
                                : "transparent"
                            }
                            _hover={{
                              bg: "gray.100",
                              _dark: { bg: "gray.600" },
                            }}
                          >
                            <Checkbox
                              isChecked={selectedTaskIds.includes(task.id)}
                              onChange={() => toggleTaskSelection(task.id)}
                              mr="3"
                              aria-label={`Select task ${task.title}`}
                              colorScheme="blue"
                            />
                            <Box flex={1}>
                              <TaskItem
                                task={task}
                                onAssignAgent={handleAssignAgent}
                                onDeleteInitiate={
                                  handleDeleteInitiateInListView
                                }
                                onClick={() => setSelectedTask(task)}
                                onCopyGetCommand={handleCopyTaskGetCommand}
                              />
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        ))}
      </Box>
      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          taskId={selectedTask.id}
        />
      )}
      {editTask && (
        <EditTaskModal
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
          task={editTask as Task}
          onUpdate={async (id, data) => {
            await editTaskInStore(id, data);
            setEditTask(null);
          }}
        />
      )}
      <Modal
        isOpen={!!assignAgentTask}
        onClose={() => setAssignAgentTask(null)}
        size={isMobile ? "full" : "md"}
        isCentered={!isMobile}
      >
        <ModalOverlay />
        <ModalContent bg="bg.modal">
          <ModalHeader borderBottomWidth="1px" borderColor="border.base">
            Assign Agent
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {agentLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={sizing.spacing['5']}
              >
                <Spinner color="primary" />
              </Box>
            ) : (
              <List spacing={2}>
                {agents.length === 0 && (
                  <ListItem>No agents available.</ListItem>
                )}
                {agents.map((agent) => (
                  <ListItem
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    cursor="pointer"
                    _hover={{ bg: "bg.subtle" }}
                    p={2}
                    rounded="md"
                  >
                    {agent.name}
                  </ListItem>
                ))}
              </List>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="border.base">
            <Button variant="ghost" onClick={() => setAssignAgentTask(null)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="bg.modal">
            <AlertDialogHeader
              fontSize={typography.fontSize.lg}
              fontWeight={typography.fontWeight.bold}
              borderBottomWidth="1px"
              borderColor="border.base"
            >
              Delete Task
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete &quot;{taskToDelete?.title}&quot;?
              This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter borderTopWidth="1px" borderColor="border.base">
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirmInListView}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default React.memo(ListView);
