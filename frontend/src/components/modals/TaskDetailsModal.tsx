"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Tag,
  Spinner,
  Box,
  Heading,
  Divider,
  TagLeftIcon,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import { Task } from "@/types"; // Corrected import for Task
import { getTaskById } from "@/services/api"; // Assuming getTaskById exists
import { useTaskStore } from "@/store/taskStore"; // To potentially get project/agent names if not in task detail
import { getDisplayableStatus, StatusID } from "@/lib/statusUtils"; // Added import
import { DeleteIcon, DownloadIcon, RepeatClockIcon } from "@chakra-ui/icons";
import AppIcon from "../common/AppIcon";
import { typography, sizing, shadows } from "@/tokens"; // Added tokens

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project_id: string | null; // Use project_id as part of composite key
  task_number: number | null; // Use task_number as part of composite key
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  project_id, // Get project_id from props
  task_number, // Get task_number from props
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Move Zustand hooks to top level
  const projects = useTaskStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const agents = useTaskStore((state) => state.agents);
  const archiveTaskStore = useTaskStore((state) => state.archiveTask);
  const unarchiveTaskStore = useTaskStore((state) => state.unarchiveTask);
  const deleteTaskStore = useTaskStore((state) => state.deleteTask);
  const toast = useToast();

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Check for both project_id and task_number
    if (isOpen && project_id !== null && task_number !== null) {
      const fetchTaskDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Use composite key to find task in store
          const storeTask = tasks.find((t) => t.project_id === project_id && t.task_number === task_number);
          if (storeTask) {
            setTask(storeTask);
          } else {
            try {
              // Use composite key for API call
              const fetchedTask = await getTaskById(project_id, task_number);
              setTask(fetchedTask);
            } catch (fetchError) {
              console.error("Failed to fetch task by ID:", fetchError);
              setError("Failed to load task details.");
              setTask(null);
            }
          }
        } catch (e) {
          console.error("Failed to load task details:", e);
          const message =
            e instanceof Error ? e.message : "Could not load task details.";
          setError(message);
          setTask(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTaskDetails();
    } else {
      setTask(null);
      setIsLoading(false);
      setError(null);
    }
  // Add project_id and task_number to the dependency array
  }, [isOpen, project_id, task_number, tasks]);

  const handleArchive = async () => {
    if (!task) return;
    try {
      await archiveTaskStore(task.project_id, task.task_number);
      toast({
        title: "Task archived",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose(); // Close modal after action
    } catch (err) {
      toast({
        title: "Error archiving task",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUnarchive = async () => {
    if (!task) return;
    try {
      await unarchiveTaskStore(task.project_id, task.task_number);
      toast({
        title: "Task unarchived",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose(); // Close modal after action
    } catch (err) {
      toast({
        title: "Error unarchiving task",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteInitiate = () => {
    onAlertOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    try {
      await deleteTaskStore(task.project_id, task.task_number);
      toast({
        title: task.is_archived
          ? "Archived task permanently deleted"
          : "Task deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onAlertClose();
      onClose(); // Close main modal after delete
    } catch (err) {
      toast({
        title: "Error deleting task",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Use projects from top-level hook
  const getProjectName = (projectId: string | undefined | null) => {
    if (!projectId) return "N/A";
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Agent name is already on task object from the store/API, but if it were just an ID:
  // const getAgentDisplayName = (agentName: string | undefined | null) => {
  //     if (!agentName) return 'Unassigned';
  //     return agentName; // Or lookup in agents list if only ID was available
  // };

  const agent = agents.find((a) => a.id === task?.agent_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" bg="overlayDefault" />
      <ModalContent
        bg="bgModal"
        color="onSurface"
        borderColor="borderDecorative"
        borderWidth={sizing.borderWidth.DEFAULT}
        borderRadius={sizing.borderRadius.lg}
      >
        <ModalHeader
          borderBottomWidth={sizing.borderWidth.DEFAULT}
          borderColor="borderDecorative"
          color="textPrimary"
          py={sizing.spacing[3]}
          px={sizing.spacing[4]}
          fontSize={typography.fontSize.lg}
          fontWeight={typography.fontWeight.semibold}
          display="flex"
          alignItems="center"
        >
          <AppIcon name="task" boxSize={5} mr={sizing.spacing[2]} />
          {task ? task.title : "Task Details"}
          {isLoading && (
            <Spinner
              size="sm"
              ml={sizing.spacing[2]}
              color="textSecondary"
              thickness="2px"
            />
          )}
          {task?.is_archived && (
            <Badge
              bg="bgNeutralSubtle"
              color="textNeutralEmphasis"
              ml={sizing.spacing[3]}
              fontSize={typography.fontSize.xs}
              px={sizing.spacing[2]}
              py={sizing.spacing[1]}
              borderRadius={sizing.borderRadius.sm}
              fontWeight={typography.fontWeight.medium}
            >
              Archived
            </Badge>
          )}
        </ModalHeader>
        <ModalCloseButton
          color="iconPrimary"
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }}
          _active={{ bg: "interactiveNeutralActive" }}
          top="10px"
          right="10px"
        />
        {isLoading && (
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="200px"
          >
            <Spinner size="xl" color="brandPrimary" thickness="4px" />
          </ModalBody>
        )}
        {error && !isLoading && (
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minH="200px"
            textAlign="center"
          >
            <AppIcon
              name="warning"
              boxSize={12}
              color="textStatusError"
              mb={sizing.spacing[3]}
            />
            <Heading
              as="h3"
              size="md"
              color="textStatusError"
              mb={sizing.spacing[2]}
            >
              Error Loading Task
            </Heading>
            <Text color="textSecondary">{error}</Text>
          </ModalBody>
        )}
        {!isLoading && !error && task && (
          <ModalBody py={sizing.spacing[5]} px={sizing.spacing[4]}>
            <Text color="textSecondary">
              No task selected or details unavailable.
            </Text>

            {task && (
              <VStack spacing="4" align="stretch">
                <Box>
                  <Heading
                    size="sm"
                    fontWeight="medium"
                    mb="1"
                    color="textPrimary"
                  >
                    Description
                  </Heading>
                  <Text
                    whiteSpace="pre-wrap"
                    maxWidth="80ch"
                    color="textSecondary"
                  >
                    {task.description || "No description provided."}
                  </Text>
                </Box>
                <Divider borderColor="borderDecorative" my="4" />
                <HStack justify="space-between" align="flex-start">
                  <Box>
                    <Heading
                      size="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="textSecondary"
                      mb="0.5"
                    >
                      Status
                    </Heading>
                    <Box ml="2">
                      {(() => {
                        const statusId = (task.status || "Unknown") as StatusID;
                        const statusInfo = getDisplayableStatus(statusId, task.title);
                        if (!statusInfo) {
                          return (
                            <Tag
                              p="1 3"
                              borderRadius="md"
                              fontSize="sm"
                              fontWeight="medium"
                              bg="gray.100"
                              color="gray.800"
                            >
                              Unknown Status
                            </Tag>
                          );
                        }
                        const { displayName, colorScheme, icon } = statusInfo;
                        let tagBg = "gray.100";
                        let tagColor = "gray.800";
                        switch (colorScheme) {
                          case "blue":
                            tagBg = "blue.100";
                            tagColor = "blue.800";
                            break;
                          case "green":
                            tagBg = "green.100";
                            tagColor = "green.800";
                            break;
                          case "yellow":
                            tagBg = "yellow.100";
                            tagColor = "yellow.800";
                            break;
                          case "red":
                            tagBg = "red.100";
                            tagColor = "red.800";
                            break;
                          case "orange":
                            tagBg = "orange.100";
                            tagColor = "orange.800";
                            break;
                        }
                        return (
                          <Tag
                            p="1 3"
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="medium"
                            bg={tagBg}
                            color={tagColor}
                          >
                            {icon && typeof icon !== "string" && (
                              <TagLeftIcon as={icon} />
                            )}
                            <Text>{displayName}</Text>
                          </Tag>
                        );
                      })()}
                    </Box>
                  </Box>
                  <Box>
                    <Heading
                      size="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="textSecondary"
                      mb="0.5"
                    >
                      Project
                    </Heading>
                    <Text color="textPrimary" fontSize="base">
                      {getProjectName(task.project_id)}
                    </Text>
                  </Box>
                </HStack>
                <HStack justify="space-between" align="flex-start">
                  <Box>
                    <Heading
                      size="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="textSecondary"
                      mb="0.5"
                    >
                      Agent
                    </Heading>
                    <Text color="textPrimary" fontSize="base">
                      {agent ? agent.name : task?.agent_name || "Unassigned"}
                    </Text>
                  </Box>
                </HStack>
                <Divider borderColor="borderDecorative" my="4" />
                <Box>
                  <Heading
                    size="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="textSecondary"
                    mb="0.5"
                  >
                    Timestamps
                  </Heading>
                  <Text color="textPrimary" fontSize="base">
                    Created: {new Date(task.created_at).toLocaleString()}
                  </Text>
                  <Text color="textPrimary" fontSize="base">
                    Updated:{" "}
                    {task.updated_at
                      ? new Date(task.updated_at).toLocaleString()
                      : "N/A"}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
        )}
        {!isLoading && !error && task && (
          <ModalFooter
            borderTopWidth={sizing.borderWidth.DEFAULT}
            borderColor="borderDecorative"
            py={sizing.spacing[3]}
            px={sizing.spacing[4]}
          >
            <Button variant="outline" onClick={onClose} mr={sizing.spacing[3]}>
              Close
            </Button>
            {task && !task.is_archived && (
              <>
                <Button
                  leftIcon={<DownloadIcon />}
                  onClick={handleArchive}
                  variant="outline"
                  borderColor="primary"
                  color="primary"
                  _hover={{ bg: "surfaceElevated" }}
                  px="4"
                  py="2"
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="condensed"
                >
                  Archive Task
                </Button>
                <Button
                  leftIcon={<DeleteIcon />}
                  onClick={handleDeleteInitiate}
                  variant="outline"
                  borderColor="error"
                  color="error"
                  _hover={{ bg: "errorBgSubtle" }}
                  px="4"
                  py="2"
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="condensed"
                >
                  Delete Task
                </Button>
              </>
            )}
            {task && task.is_archived && (
              <>
                <Button
                  leftIcon={<RepeatClockIcon />}
                  onClick={handleUnarchive}
                  variant="outline"
                  borderColor="teal.500"
                  color="teal.600"
                  _hover={{ bg: "teal.50" }}
                  px="4"
                  py="2"
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="condensed"
                >
                  Unarchive Task
                </Button>
                <Button
                  leftIcon={<DeleteIcon />}
                  onClick={handleDeleteInitiate}
                  variant="outline"
                  borderColor="error"
                  color="error"
                  _hover={{ bg: "errorBgSubtle" }}
                  px="4"
                  py="2"
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="condensed"
                >
                  Delete Task Permanently
                </Button>
              </>
            )}
          </ModalFooter>
        )}
      </ModalContent>
      {task && (
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onAlertClose}
          isCentered // Ensure it is centered
          size={{ base: "sm", md: "md" }} // Responsive size
        >
          <AlertDialogOverlay bg="overlayDefault" backdropFilter="blur(2px)" />
          <AlertDialogContent
            bg="bgModal" // Consistent with main modal
            color="onSurface"
            borderWidth={sizing.borderWidth.DEFAULT}
            borderColor="borderDecorative"
            borderRadius={sizing.borderRadius.lg}
            boxShadow={shadows.lg} // Add elevation shadow
          >
            <AlertDialogHeader
              fontSize={typography.fontSize.lg}
              fontWeight={typography.fontWeight.semibold}
              borderBottomWidth={sizing.borderWidth.DEFAULT}
              borderColor="borderDecorative"
              py={sizing.spacing[3]}
              px={sizing.spacing[4]}
              display="flex"
              alignItems="center"
            >
              <AppIcon
                name="delete"
                color="iconDanger"
                mr={sizing.spacing[2]}
              />{" "}
              {/* Added iconDanger */}
              Delete Task
            </AlertDialogHeader>

            <AlertDialogBody
              py={sizing.spacing[4]}
              px={sizing.spacing[4]}
              fontSize={typography.fontSize.sm}
            >
              Are you sure you want to delete this task? This action cannot be
              undone.
              {task?.is_archived && (
                <Text
                  as="span"
                  fontWeight={typography.fontWeight.semibold}
                  color="textStatusWarning"
                  ml={sizing.spacing[1]}
                >
                  This is an archived task.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter
              borderTopWidth={sizing.borderWidth.DEFAULT}
              borderColor="borderDecorative"
              py={sizing.spacing[3]}
              px={sizing.spacing[4]}
              bg="bgModal" // Consistent footer bg
            >
              <Button
                ref={cancelRef}
                onClick={onAlertClose}
                variant="ghost"
                color="textSecondary"
                _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                _active={{ bg: "interactiveNeutralActive" }}
                h={sizing.height.sm}
                fontSize={typography.fontSize.xs}
                fontWeight={typography.fontWeight.medium}
                mr={sizing.spacing[2]}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                bg="interactiveDanger" // Changed from error
                color="onInteractiveDanger" // Changed from onError.DEFAULT
                _hover={{ bg: "interactiveDangerHover" }}
                _active={{ bg: "interactiveDangerActive" }}
                h={sizing.height.sm}
                fontSize={typography.fontSize.xs}
                fontWeight={typography.fontWeight.medium}
                leftIcon={<DeleteIcon boxSize={sizing.spacing[3]} />} // Use Chakra icon directly
              >
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Modal>
  );
};

export default TaskDetailsModal;
