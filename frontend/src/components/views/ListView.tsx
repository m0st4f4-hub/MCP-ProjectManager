import React, { useState, useEffect } from "react";
import {
  Button,
  Spinner,
  useToast,
  List,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { Task, Agent } from "@/types";
import { useAgentStore } from "@/store/agentStore";
import { useTaskStore } from "@/store/taskStore";
import EditTaskModal from "../modals/EditTaskModal";
import TaskDetailsModal from "../modals/TaskDetailsModal";
import { AgentState } from "@/store/agentStore";
import { TaskState } from "@/store/taskStore";
import { typography } from "../../tokens";
import { sizing } from "../../tokens";
import AgentAssignmentModal from "../modals/AgentAssignmentModal";
import ListGroup from "./ListGroup";
import ListTaskMobile from "./ListTaskMobile";
import type { ListViewProps } from "./ListView.types";

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
        minHeight={sizing.spacing["5"]}
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
      await deleteTaskFromStore(taskToDelete.project_id, taskToDelete.task_number);
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
      await editTaskInStore(assignAgentTask.project_id, assignAgentTask.task_number, {
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

  const handleCopyTaskGetCommand = async (project_id: string, task_number: number) => {
    const command = `mcp task get --id ${project_id}-${task_number}`;
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
          {flatTasksForMobile.map((task) => {
            const taskKey = `${task.project_id}-${task.task_number}`;
            return (
            <ListTaskMobile
                key={taskKey}
              task={task}
                selected={selectedTaskIds.includes(taskKey)}
                onSelect={() => toggleTaskSelection(taskKey)}
              onAssignAgent={handleAssignAgent}
              onDeleteInitiate={handleDeleteInitiateInListView}
              onClick={() => setSelectedTask(task)}
              onCopyGetCommand={() => handleCopyTaskGetCommand(task.project_id, task.task_number)}
            />
            );
          })}
        </AnimatePresence>
      </List>
    );
  }

  return (
    <>
      <Box pt="4" pb="4">
        {groupedTasks.groups.map((group) => (
          <ListGroup
            key={group.id}
            group={group}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            selectedTaskIds={selectedTaskIds}
            toggleTaskSelection={toggleTaskSelection}
            handleAssignAgent={handleAssignAgent}
            handleDeleteInitiate={handleDeleteInitiateInListView}
            setSelectedTask={setSelectedTask}
            handleCopyTaskGetCommand={(task) => handleCopyTaskGetCommand(task.project_id, task.task_number)}
          />
        ))}
      </Box>
      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          taskId={`${selectedTask.project_id}-${selectedTask.task_number}`}
        />
      )}
      {editTask && (
        <EditTaskModal
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
          task={editTask as Task}
          onUpdate={async (project_id, task_number, data) => {
            await editTaskInStore(project_id, task_number, data);
            setEditTask(null);
          }}
        />
      )}
      <AgentAssignmentModal
        isOpen={!!assignAgentTask}
        onClose={() => setAssignAgentTask(null)}
        agents={agents}
        loading={agentLoading}
        onSelect={handleAgentSelect}
        selectedTask={assignAgentTask ?? undefined}
      />
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
