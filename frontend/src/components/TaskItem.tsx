// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
"use client";

import React, { useCallback, useState, memo, useMemo } from "react";
import {
  Box,
  Checkbox,
  Text,
  IconButton,
  HStack,
  VStack,
  useDisclosure,
  Tag,
  TagLabel,
  TagLeftIcon,
  Flex,
  Icon,
  Avatar,
  Tooltip, // Still used for other elements (project/agent tags, details button)
  useToast,
  Collapse, // Used for TaskDetailsSection
  Input, // Used for inline title editing
  Textarea, // Used for inline description editing
  useToken,
  useTheme, // Restored as it's used elsewhere in the file
} from "@chakra-ui/react";
import {
  EditIcon as ChakraEditIcon,
  CheckIcon as ChakraCheckIcon,
  RepeatClockIcon as ChakraRepeatClockIcon,
  TimeIcon as ChakraTimeIcon,
  WarningTwoIcon as ChakraWarningTwoIcon,
  CheckCircleIcon as ChakraCheckCircleIcon,
  InfoOutlineIcon as ChakraInfoOutlineIcon,
  CopyIcon as ChakraCopyIcon, // Keep for now, AppIcon might use it. TaskMenu handles its own.
  // QuestionOutlineIcon, NotAllowedIcon, EmailIcon, ListOrderedIcon are managed by TaskMenu or not used.
} from "@chakra-ui/icons";
import { GoProject } from "react-icons/go";
import { BsPerson } from "react-icons/bs";
import EditTaskModal from "./modals/EditTaskModal";
import TaskDetailsModal from "./modals/TaskDetailsModal";
import TaskDetailsSection from "./TaskDetailsSection";
import EditTaskButton from "./buttons/EditTaskButton"; // Added import
import TaskMenu from "./menus/TaskMenu";
import TaskItemAgentAssignmentModal from "./modals/TaskItemAgentAssignmentModal"; // Added import
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import {
  getDisplayableStatus,
  StatusID,
  getAllStatusIds,
  getStatusAttributes,
} from "@/lib/statusUtils";
import { Task } from "@/types";
import AppIcon from "./common/AppIcon";

interface TaskItemProps {
  task: Task;
  compact?: boolean;
  style?: React.CSSProperties;
  onDeleteInitiate: (task: Task) => void;
  onAssignAgent?: (task: Task) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCopyGetCommand?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(
  ({
    task,
    compact = false,
    style,
    onDeleteInitiate,
    onAssignAgent,
    onClick,
    onCopyGetCommand,
  }) => {
    const theme = useTheme(); // Restored as it's used elsewhere in the file
    const {
      isOpen: isEditTaskModalOpen,
      onOpen: onOpenEditTaskModal,
      onClose: onCloseEditTaskModal,
    } = useDisclosure();
    const {
      isOpen: isDetailsModalOpen,
      onOpen: onOpenDetailsModal,
      onClose: onCloseDetailsModal,
    } = useDisclosure();
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find((p) => p.id === task.project_id)?.name;

    const editTaskInStore = useTaskStore((state) => state.updateTask);
    const archiveTaskInStore = useTaskStore((state) => state.archiveTask);
    const unarchiveTaskInStore = useTaskStore((state) => state.unarchiveTask);
    const storeAgents = useTaskStore((state) => state.agents || []); // This will be passed to the new modal

    const [isAgentModalOpen, setAgentModalOpen] = useState(false); // This remains to control visibility
    // agentLoading state is removed, managed by TaskItemAgentAssignmentModal
    const toast = useToast(); // This might be passed or used by the new modal if it creates its own toasts
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(
      task.description || "",
    );

    const currentStatusId = (task.status || "TO_DO") as StatusID;
    const statusInfo = getDisplayableStatus(currentStatusId, task.title);

    const statusDisplayName = statusInfo?.displayName ?? "Unknown Status";
    const rawStatusIcon = statusInfo?.icon; // This is still needed for the Tag's StatusIconComponent

    // iconMap and StatusIconComponent for menu items are moved to TaskMenu.tsx
    // However, StatusIconComponent for the Tag below needs to be resolved here.
    // Let's define a minimal iconMap here for the Tag status icon only.
    const tagIconMap: Record<string, React.ElementType> = {
        EditIcon: ChakraEditIcon, // Retained for tag
        TimeIcon: ChakraTimeIcon, // Retained for tag
        WarningTwoIcon: ChakraWarningTwoIcon, // Retained for tag
        CheckCircleIcon: ChakraCheckCircleIcon, // Retained for tag
        InfoOutlineIcon: ChakraInfoOutlineIcon, // Retained for tag
        RepeatClockIcon: ChakraRepeatClockIcon, // Retained for tag
        CheckIcon: ChakraCheckIcon, // Retained for tag
        // QuestionOutlineIcon, NotAllowedIcon, EmailIcon, CopyIcon, ListOrderedIcon are not for status tags.
    };

    const StatusIconComponent = // This is for the Tag's visual indicator
      typeof rawStatusIcon === "string"
        ? tagIconMap[rawStatusIcon]
        : rawStatusIcon;

    // The full iconMap and its related Chakra icon imports are managed by TaskMenu.tsx

    const [
      accentToDo,
      accentInProgress,
      accentBlocked,
      accentPending,
      accentCompleted,
      accentDefault,
      statusTagToDoBg,
      statusTagToDoColor,
      statusTagInProgressBg,
      statusTagInProgressColor,
      statusTagBlockedBg,
      statusTagBlockedColor,
      statusTagPendingBg,
      statusTagPendingColor,
      statusTagCompletedBg,
      statusTagCompletedColor,
      statusTagDefaultBg,
      statusTagDefaultColor,
      projectTagBg,
      projectTagColor,
      agentTagBg,
      agentTagColor,
      textPrimaryColor,
      textSecondaryColor,
      textDisabledColor,
      borderDecorativeColor,
      borderInteractiveFocusedColor,
      bgSurfaceColor,
      bgSurfaceElevatedColor,
      bgInteractiveSubtleHoverColor,
      coreRed50,
      coreRed500,
      coreRed600,
      coreRed700,
      coreGreen500,
      coreBlue100,
      coreBlue700,
    ] = useToken("colors", [
      "blue.500",
      "yellow.500",
      "red.500",
      "orange.500",
      "green.500",
      "neutralGray.500",
      "blue.100",
      "blue.800",
      "yellow.100",
      "yellow.800",
      "red.100",
      "red.800",
      "orange.100",
      "orange.800",
      "green.100",
      "green.800",
      "neutralGray.100",
      "neutralGray.800",
      "purple.100",
      "purple.800",
      "teal.100",
      "teal.800",
      "textPrimary",
      "textSecondary",
      "textDisabled",
      "borderDecorative",
      "borderInteractiveFocused",
      "bgSurface",
      "bgSurfaceElevated",
      "bgInteractiveSubtleHover",
      "red.50",
      "red.500",
      "red.600",
      "red.700",
      "green.500",
      "blue.100",
      "blue.700",
    ]);

    const getStatusAccentColor = (status: StatusID) => {
      switch (status) {
        case "TO_DO":
          return accentToDo;
        case "IN_PROGRESS":
          return accentInProgress;
        case "BLOCKED":
          return accentBlocked;
        case "PENDING_VERIFICATION":
          return accentPending;
        case "COMPLETED":
          return accentCompleted;
        default:
          return accentDefault;
      }
    };

    const getStatusTagColors = (
      status: StatusID,
    ): { bg: string; color: string } => {
      switch (status) {
        case "TO_DO":
          return { bg: statusTagToDoBg, color: statusTagToDoColor };
        case "IN_PROGRESS":
          return { bg: statusTagInProgressBg, color: statusTagInProgressColor };
        case "BLOCKED":
          return { bg: statusTagBlockedBg, color: statusTagBlockedColor };
        case "PENDING_VERIFICATION":
          return { bg: statusTagPendingBg, color: statusTagPendingColor };
        case "COMPLETED":
          return { bg: statusTagCompletedBg, color: statusTagCompletedColor };
        default:
          return { bg: statusTagDefaultBg, color: statusTagDefaultColor };
      }
    };

    const handleToggleCompletion = useCallback(async () => {
      const newStatus = task.status !== "COMPLETED" ? "COMPLETED" : "TO_DO";
      try {
        await editTaskInStore(task.id, { status: newStatus });
      } catch {
        toast({
          title: "Error updating status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }, [task.id, task.status, editTaskInStore, toast]);

    const handleAssignAgent = useCallback(() => {
      if (onAssignAgent) onAssignAgent(task);
      else setAgentModalOpen(true);
    }, [onAssignAgent, task]);

  // handleAgentSelect is removed, its logic is now within TaskItemAgentAssignmentModal

    const handleStatusChange = async (newStatus: StatusID) => {
      try {
        await editTaskInStore(task.id, { status: newStatus });
        toast({
          title: `Status set to ${getDisplayableStatus(newStatus)?.displayName || newStatus}`,
          status: "info",
          duration: 1500,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Error updating status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const handleCopyPrompt = () => {
      let agentName = task.agent_name;
      if ((!agentName || agentName === "—") && task.agent_id) {
        const agent = storeAgents.find((a) => a.id === task.agent_id);
        agentName = agent ? agent.name : undefined;
      }
      let promptText;
      if (!agentName || agentName === "—") {
        promptText = `No agent is currently assigned to this task. Please assign an agent, then execute the following:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Once assigned, the agent should work on this task, update its status as they progress, and mark it as finished when done.`;
      } else {
        promptText = `@${agentName}, please execute the assigned task:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Work on this task, update its status as you progress, and mark it as finished when done.`;
      }
      navigator.clipboard.writeText(promptText).then(
        () => {
          toast({
            title: "Prompt copied to clipboard!",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        },
        () => {
          toast({
            title: "Failed to copy prompt.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        },
      );
    };

    const startEditingTitle = () => {
      setEditTitle(task.title);
      setIsEditingTitle(true);
      if (task.status !== "IN_PROGRESS") {
        editTaskInStore(task.id, { status: "IN_PROGRESS" });
      }
    };
    const startEditingDescription = () => {
      setEditDescription(task.description || "");
      setIsEditingDescription(true);
      if (task.status !== "IN_PROGRESS") {
        editTaskInStore(task.id, { status: "IN_PROGRESS" });
      }
    };
    const saveTitle = async () => {
      if (editTitle.trim() !== task.title) {
        await editTaskInStore(task.id, { title: editTitle.trim() });
      }
      setIsEditingTitle(false);
    };
    const saveDescription = async () => {
      if (editDescription.trim() !== (task.description || "")) {
        await editTaskInStore(task.id, { description: editDescription.trim() });
      }
      setIsEditingDescription(false);
    };
    const cancelTitle = () => {
      setEditTitle(task.title);
      setIsEditingTitle(false);
    };
    const cancelDescription = () => {
      setEditDescription(task.description || "");
      setIsEditingDescription(false);
    };

    const availableStatuses = useMemo(() => {
      return getAllStatusIds().filter((id) => {
        const attrs = getStatusAttributes(id);
        return (attrs && !attrs.isTerminal) || id === currentStatusId;
      });
    }, [currentStatusId]);

    const handleArchiveTask = async () => {
      try {
        await archiveTaskInStore(task.id);
        toast({
          title: "Task archived",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Error archiving task",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    const handleUnarchiveTask = async () => {
      try {
        await unarchiveTaskInStore(task.id);
        toast({
          title: "Task unarchived",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Error unarchiving task",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const currentAccentColor = getStatusAccentColor(currentStatusId);
    const currentStatusTagColors = getStatusTagColors(currentStatusId);

    const textColor = task.is_archived ? textDisabledColor : textPrimaryColor;

    const titleFontSize = useMemo(() => {
      if (compact) {
        return theme.fontSizes.sm;
      }
      return theme.fontSizes.base;
    }, [compact, theme.fontSizes]);
    const titleFontWeight = useMemo(
      () => theme.fontWeights.medium,
      [theme.fontWeights],
    );

    const descriptionFontSize = useMemo(() => {
      if (compact) {
        return theme.fontSizes.sm;
      }
      return theme.fontSizes.base;
    }, [compact, theme.fontSizes]);
    const descriptionFontWeight = useMemo(
      () => theme.fontWeights.medium,
      [theme.fontWeights],
    );

    const tagFontSize = useMemo(() => {
      if (compact) {
        return theme.fontSizes.xs;
      }
      return theme.fontSizes.sm;
    }, [compact, theme.fontSizes]);
    // detailTextFontSize is now derived within TaskDetailsSection
    // const detailTextFontSize = useMemo(() => {
    //   if (compact) {
    //     return theme.fontSizes.xs;
    //   }
    //   return theme.fontSizes.sm;
    // }, [compact, theme.fontSizes]);

    const agentTagStyle = useMemo(
      () => ({
        bg: agentTagBg,
        color: agentTagColor,
        fontWeight: theme.fontWeights.medium,
      }),
      [agentTagBg, agentTagColor, theme.fontWeights],
    );

    const projectTagStyle = useMemo(
      () => ({
        bg: projectTagBg,
        color: projectTagColor,
        fontWeight: theme.fontWeights.medium,
      }),
      [projectTagBg, projectTagColor, theme.fontWeights],
    );

    const statusTagStyle = useMemo(() => {
      const { bg, color } = getStatusTagColors(currentStatusId);
      return {
        bg,
        color,
        fontWeight: theme.fontWeights.medium,
      };
    }, [currentStatusId, getStatusTagColors, theme.fontWeights]);

    // Styles for inline editing
    const inputStyle = {
      p: 1,
      m: "-1px", // to align with Text
      border: "1px solid",
      borderColor: borderInteractiveFocusedColor,
      borderRadius: "md",
      boxShadow: `0 0 0 1px ${borderInteractiveFocusedColor}`,
      fontSize: theme.fontSizes.sm,
      height: "auto", // Ensure it fits content
      minHeight: "24px", // Match typical text height
    };

    const textareaStyle = {
      p: 1,
      m: "-1px",
      border: "1px solid",
      borderColor: borderInteractiveFocusedColor,
      borderRadius: "md",
      boxShadow: `0 0 0 1px ${borderInteractiveFocusedColor}`,
      fontSize: theme.fontSizes.sm,
      height: "auto",
      minHeight: "40px", // Slightly more for textarea
    };

    const buttonTextStyle = {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.regular,
      ml: 1,
    };
    const buttonSubtleTextStyle = {
      fontSize: theme.fontSizes.sm,
      color: textSecondaryColor,
      ml: 1,
    };

    // menuItemsBaseStyle is removed (moved to TaskMenu.tsx)
    // editTaskModalContentStyle should be within EditTaskModal.tsx
    // taskDetailsModalContentStyle should be within TaskDetailsModal.tsx
    // subTask... styles and noSubTasksTextStyle are likely for TaskDetailsModal or similar, not directly used in TaskItem's JSX.

    return (
      <Box
        p={compact ? "spacing.2" : "spacing.4"}
        borderRadius="radii.md"
        borderWidth="borders.width.xs"
        borderStyle="solid"
        borderColor={borderDecorativeColor}
        boxShadow="shadows.sm"
        transition="all 0.2s ease-in-out"
        position="relative"
        overflow="hidden"
        bg={
          task.status === "COMPLETED" ? bgSurfaceElevatedColor : bgSurfaceColor
        }
        borderLeftWidth="spacing.1"
        borderLeftStyle="solid"
        borderLeftColor={currentAccentColor}
        _hover={{
          boxShadow: "shadows.md",
          transform: "translateY(-1px)",
        }}
        style={style}
        onClick={onClick}
      >
        <HStack alignItems="flex-start" width="100%" gap="spacing.3">
          <Box pt="spacing.0-5">
            <Checkbox
              isChecked={task.status === "COMPLETED"}
              onChange={handleToggleCompletion}
              size="lg"
              colorScheme={statusInfo?.colorScheme || "gray"}
              aria-label={`Mark task ${task.title} as ${task.status === "COMPLETED" ? "incomplete" : "complete"}`}
            />
          </Box>

          <VStack
            alignItems="flex-start"
            flexGrow={1}
            minW={0}
            gap={compact ? "spacing.0-5" : "spacing.1"}
          >
            <Flex
              width="100%"
              justifyContent="space-between"
              alignItems="center"
              gap="spacing.2"
            >
              {isEditingTitle ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={saveTitle}
                  autoFocus
                  variant="flushed"
                  placeholder="Task title"
                  fontSize={titleFontSize}
                  fontWeight={titleFontWeight}
                  color={textColor}
                  sx={inputStyle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") cancelTitle();
                  }}
                />
              ) : (
                <Text
                  onClick={(e) => { e.stopPropagation(); startEditingTitle(); }}
                  fontSize={titleFontSize}
                  fontWeight={titleFontWeight}
                  color={textColor}
                  textDecoration={
                    task.status === "COMPLETED" ? "line-through" : "none"
                  }
                  cursor="pointer"
                  noOfLines={2}
                >
                  {task.title}
                </Text>
              )}
              {isEditingTitle && (
                <HStack gap="spacing.1">
                  <IconButton
                    aria-label="Save title"
                    icon={<AppIcon name="check" />}
                    onClick={saveTitle}
                    size="xs"
                    variant="ghost"
                    color={textColor}
                    _hover={{
                      bg: bgInteractiveSubtleHoverColor,
                      color: coreGreen500,
                    }}
                  />
                  <IconButton
                    aria-label="Cancel edit title"
                    icon={<AppIcon name="close" />}
                    onClick={cancelTitle}
                    size="xs"
                    variant="ghost"
                    color={textColor}
                    _hover={{
                      bg: bgInteractiveSubtleHoverColor,
                      color: coreRed500,
                    }}
                  />
                </HStack>
              )}
            </Flex>

            {(task.description || isEditingDescription) &&
              (isEditingDescription ? (
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onBlur={saveDescription}
                  autoFocus
                  variant="flushed"
                  placeholder="Task description"
                  rows={1}
                  fontSize={descriptionFontSize}
                  fontWeight={descriptionFontWeight}
                  color={textSecondaryColor}
                  sx={textareaStyle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) saveDescription();
                    if (e.key === "Escape") cancelDescription();
                  }}
                />
              ) : (
                <Text
                  onClick={(e) => { e.stopPropagation(); startEditingDescription(); }}
                  fontSize={descriptionFontSize}
                  color={textColor}
                  cursor="pointer"
                  noOfLines={compact ? 1 : 2}
                >
                  {task.description}
                </Text>
              ))}
            {isEditingDescription && (
              <HStack gap="spacing.1" justifyContent="flex-end" w="full">
                <IconButton
                  aria-label="Save description"
                  icon={<AppIcon name="check" />}
                  onClick={saveDescription}
                  size="xs"
                  variant="ghost"
                  color={textColor}
                  _hover={{
                    bg: bgInteractiveSubtleHoverColor,
                    color: coreGreen500,
                  }}
                />
                <IconButton
                  aria-label="Cancel edit description"
                  icon={<AppIcon name="close" />}
                  onClick={cancelDescription}
                  size="xs"
                  variant="ghost"
                  color={textColor}
                  _hover={{
                    bg: bgInteractiveSubtleHoverColor,
                    color: coreRed500,
                  }}
                />
              </HStack>
            )}

            <HStack
              gap="spacing.1"
              mt={compact ? "spacing.1" : "spacing.2"}
              flexWrap="wrap"
            >
              <Tag
                size="sm"
                bg={currentStatusTagColors.bg}
                color={currentStatusTagColors.color}
                borderRadius="radii.round"
                px="spacing.2"
                py="spacing.0-5"
                fontWeight={statusTagStyle.fontWeight}
              >
                {StatusIconComponent && (
                  <TagLeftIcon as={StatusIconComponent} />
                )}
                <TagLabel>{statusDisplayName}</TagLabel>
              </Tag>
              {projectName && (
                <Tooltip label={`Project: ${projectName}`}>
                  <Tag
                    size="sm"
                    bg={projectTagStyle.bg}
                    color={projectTagStyle.color}
                    borderRadius="radii.round"
                    px="spacing.2"
                    py="spacing.0-5"
                    fontWeight={projectTagStyle.fontWeight}
                  >
                    <TagLeftIcon as={GoProject} />
                    <TagLabel>{projectName}</TagLabel>
                  </Tag>
                </Tooltip>
              )}
              {task.agent_name && task.agent_name !== "—" && (
                <Tooltip label={`Agent: ${task.agent_name}`}>
                  <Tag
                    size="sm"
                    bg={agentTagStyle.bg}
                    color={agentTagStyle.color}
                    borderRadius="radii.round"
                    px="spacing.2"
                    py="spacing.0-5"
                    fontWeight={agentTagStyle.fontWeight}
                  >
                    <Avatar name={task.agent_name} size="xs" mr="spacing.1" />
                    <TagLabel>{task.agent_name}</TagLabel>
                  </Tag>
                </Tooltip>
              )}
            </HStack>
          </VStack>

          <Flex ml="spacing.2" gap="spacing.1" alignItems="center">
            <IconButton
              aria-label={detailsOpen ? "Collapse details" : "Expand details"}
              icon={
                detailsOpen ? (
                  <AppIcon name="chevronup" />
                ) : (
                  <AppIcon name="chevrondown" />
                )
              }
              onClick={(e) => { e.stopPropagation(); setDetailsOpen(!detailsOpen); }}
              size="sm"
              variant="ghost"
              color={textColor}
              _hover={{
                bg: bgInteractiveSubtleHoverColor,
                color: textPrimaryColor,
              }}
            />
            <HStack spacing="spacing.1">
              <EditTaskButton
                onClick={onOpenEditTaskModal}
                isArchived={task.is_archived}
              />
              <TaskMenu
                task={task}
                availableStatuses={availableStatuses}
                // currentStatusIconName={rawStatusIcon} // Not needed for TaskMenu's MenuButton icon itself. TaskMenu handles its internal item icons.
                onStatusChange={handleStatusChange}
                onOpenEditTaskModal={onOpenEditTaskModal}
                onCopyGetCommand={onCopyGetCommand}
                onCopyDetailedPrompt={handleCopyPrompt}
                onArchiveTask={handleArchiveTask}
                onUnarchiveTask={handleUnarchiveTask}
                onDeleteInitiate={onDeleteInitiate}
              />
            </HStack>
          </Flex>
        </HStack>

        <TaskDetailsSection
          task={task}
          isOpen={detailsOpen}
          compact={compact}
        />

        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={onCloseEditTaskModal}
          task={task}
          onUpdate={editTaskInStore}
        />
        <TaskDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={onCloseDetailsModal}
          taskId={task?.id || null}
        />

        <TaskItemAgentAssignmentModal
          isOpen={isAgentModalOpen}
          onClose={() => setAgentModalOpen(false)}
          task={task}
          agents={storeAgents}
          editTaskInStore={editTaskInStore}
          // Pass styling props
          bgSurfaceColor={bgSurfaceColor}
          textPrimaryColor={textPrimaryColor}
          textSecondaryColor={textSecondaryColor}
          borderDecorativeColor={borderDecorativeColor}
          bgInteractiveSubtleHoverColor={bgInteractiveSubtleHoverColor}
          coreBlue100={coreBlue100}
          coreBlue700={coreBlue700}
          theme={theme}
        />
      </Box>
    );
  },
);

TaskItem.displayName = "TaskItem";

export default TaskItem;
