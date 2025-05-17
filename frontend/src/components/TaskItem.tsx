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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  List,
  ListItem,
  Spinner,
  Collapse,
  Input,
  Textarea,
  useToken,
  SimpleGrid,
  useTheme,
} from "@chakra-ui/react";
import {
  EditIcon as ChakraEditIcon,
  CheckIcon as ChakraCheckIcon,
  RepeatClockIcon as ChakraRepeatClockIcon,
  TimeIcon as ChakraTimeIcon,
  WarningTwoIcon as ChakraWarningTwoIcon,
  CheckCircleIcon as ChakraCheckCircleIcon,
  InfoOutlineIcon as ChakraInfoOutlineIcon,
  QuestionOutlineIcon as ChakraQuestionOutlineIcon,
  NotAllowedIcon as ChakraNotAllowedIcon,
  EmailIcon as ChakraEmailIcon,
  CopyIcon as ChakraCopyIcon,
} from "@chakra-ui/icons";
import { GoProject } from "react-icons/go";
import { BsPerson } from "react-icons/bs";
import { RiListOrdered as ListOrderedIcon } from "react-icons/ri"; // Assuming this is the one used for 'ListOrderedIcon'
import EditTaskModal from "./modals/EditTaskModal";
import TaskDetailsModal from "./modals/TaskDetailsModal";
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
    const theme = useTheme();
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
    const storeAgents = useTaskStore((state) => state.agents || []);

    const [isAgentModalOpen, setAgentModalOpen] = useState(false);
    const [agentLoading, setAgentLoading] = useState(false);
    const toast = useToast();
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
    const rawStatusIcon = statusInfo?.icon;

    const iconMap: Record<string, React.ElementType> = {
      EditIcon: ChakraEditIcon,
      TimeIcon: ChakraTimeIcon,
      WarningTwoIcon: ChakraWarningTwoIcon,
      CheckCircleIcon: ChakraCheckCircleIcon,
      InfoOutlineIcon: ChakraInfoOutlineIcon,
      ListOrderedIcon: ListOrderedIcon, // Mapped from react-icons
      RepeatClockIcon: ChakraRepeatClockIcon,
      QuestionOutlineIcon: ChakraQuestionOutlineIcon,
      CheckIcon: ChakraCheckIcon,
      NotAllowedIcon: ChakraNotAllowedIcon,
      EmailIcon: ChakraEmailIcon,
      CopyIcon: ChakraCopyIcon,
      // Add other icons from STATUS_MAP here if they are strings
    };

    const StatusIconComponent =
      typeof rawStatusIcon === "string"
        ? iconMap[rawStatusIcon]
        : rawStatusIcon;

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

    const handleAgentSelect = async (agent: { id: string; name: string }) => {
      setAgentLoading(true);
      try {
        await editTaskInStore(task.id, {
          agent_id: agent.id,
          agent_name: agent.name,
        });
        toast({
          title: `Agent assigned: ${agent.name}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Error assigning agent",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setAgentLoading(false);
        setAgentModalOpen(false);
      }
    };

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
    const detailTextFontSize = useMemo(() => {
      if (compact) {
        return theme.fontSizes.xs;
      }
      return theme.fontSizes.sm;
    }, [compact, theme.fontSizes]);

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

    const menuItemsBaseStyle = {
      fontSize: theme.fontSizes.sm,
    };

    const editTaskModalContentStyle = {
      bg: bgSurfaceElevatedColor,
      fontSize: theme.fontSizes.sm,
    };

    const taskDetailsModalContentStyle = {
      bg: bgSurfaceElevatedColor,
      fontSize: theme.fontSizes.sm,
    };

    const subTaskTitleStyle = {
      fontSize: theme.fontSizes.xs,
      color: textSecondaryColor,
      fontWeight: theme.fontWeights.medium,
      mb: compact ? 0.5 : 1,
    };
    const subTaskProjectStyle = {
      fontWeight: theme.fontWeights.medium,
      ml: 1,
    };
    const subTaskAgentStyle = {
      fontWeight: theme.fontWeights.medium,
      ml: 1,
    };
    const subTaskStatusStyle = {
      fontWeight: theme.fontWeights.medium,
      ml: 1,
    };
    const subTaskDetailsIconStyle = {
      fontWeight: theme.fontWeights.medium,
      ml: 2,
      color: textSecondaryColor,
    };

    const noSubTasksTextStyle = {
      fontSize: theme.fontSizes.sm,
      color: textSecondaryColor,
      fontStyle: "italic",
      mt: 2,
      textAlign: "center" as const,
      fontWeight: theme.fontWeights.semibold,
    };

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
              <Tooltip label="Edit Task" placement="top">
                <IconButton
                  aria-label="Edit task"
                  icon={<AppIcon name="edit" />}
                  onClick={(e) => { e.stopPropagation(); onOpenEditTaskModal(); }}
                  size="sm"
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: bgInteractiveSubtleHoverColor, color: theme.colors.blue[500] }}
                />
              </Tooltip>

              <Menu placement="bottom-end">
                <Tooltip label="Change Status" placement="top">
                  <MenuButton
                    as={IconButton}
                    aria-label="Change task status"
                    icon={<AppIcon name="repeatclock" />}
                    onClick={(e) => e.stopPropagation()} // Prevent main card click
                    size="sm"
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: bgInteractiveSubtleHoverColor, color: theme.colors.orange[500] }}
                  />
                </Tooltip>
                <MenuList
                  bg={bgSurfaceColor}
                  borderWidth="borders.width.xs"
                  borderColor={borderDecorativeColor}
                  boxShadow="shadows.md"
                  borderRadius="radii.md"
                  minW="sizes.menu"
                  py="spacing.1"
                  zIndex="popover" // Ensure it's above other elements
                >
                  {availableStatuses.map((statusId) => {
                    const sInfo = getDisplayableStatus(statusId);
                    const ResolvedIcon =
                      typeof sInfo?.icon === "string"
                        ? iconMap[sInfo.icon]
                        : sInfo?.icon;
                    return (
                      <MenuItem
                        key={statusId}
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(statusId); }}
                        icon={
                          ResolvedIcon ? (
                            <Icon as={ResolvedIcon} />
                          ) : undefined
                        }
                        sx={{
                          px: "spacing.3",
                          py: "spacing.2",
                          gap: "spacing.2",
                          fontSize: menuItemsBaseStyle.fontSize,
                          color: textPrimaryColor,
                          borderRadius: "radii.sm",
                          mx: "spacing.1",
                          _hover: { bg: bgInteractiveSubtleHoverColor },
                        }}
                      >
                        {sInfo?.displayName || statusId}
                      </MenuItem>
                    );
                  })}
                  <MenuItem
                    icon={<AppIcon icon={ChakraEditIcon} size="1rem" />}
                    onClick={onOpenEditTaskModal}
                    color="textSecondary"
                    _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                  >
                    Edit Full Task
                  </MenuItem>
                  {onCopyGetCommand && (
                    <MenuItem
                      icon={<AppIcon icon={ChakraCopyIcon} size="1rem" />}
                      onClick={() => onCopyGetCommand(task.id)}
                      color="textSecondary"
                      _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                    >
                      Copy Get Command
                    </MenuItem>
                  )}
                  <MenuItem
                    icon={<AppIcon icon={ChakraCopyIcon} size="1rem" />}
                    onClick={handleCopyPrompt}
                    color="textSecondary"
                    _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                  >
                    Copy Detailed Prompt
                  </MenuItem>
                  {task.is_archived ? (
                    <MenuItem
                      onClick={(e) => { e.stopPropagation(); handleUnarchiveTask(); }}
                      icon={<AppIcon name="download" transform="rotate(180deg)" />}
                      color={textColor}
                      _hover={{ bg: bgInteractiveSubtleHoverColor, color: theme.colors.green[500] }}
                    >
                      Unarchive Task
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={(e) => { e.stopPropagation(); handleArchiveTask(); }}
                      icon={<AppIcon name="download" />}
                      color={textColor}
                      _hover={{ bg: bgInteractiveSubtleHoverColor, color: theme.colors.yellow[500] }}
                    >
                      Archive Task
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={(e) => { e.stopPropagation(); onDeleteInitiate(task); }}
                    icon={<AppIcon name="delete" />}
                    color={coreRed600}
                    _hover={{ bg: coreRed50, color: coreRed700 }}
                  >
                    Delete Task
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </HStack>

        <Collapse in={detailsOpen} animateOpacity>
          <Box pt={compact ? 2 : 3} pb={compact ? 1 : 2}>
            <SimpleGrid
              columns={2}
              spacingX="spacing.3"
              spacingY="spacing.1"
              fontSize={detailTextFontSize}
            >
              <Text
                color={textSecondaryColor}
                fontWeight={theme.fontWeights.medium}
                textAlign="right"
              >
                ID:
              </Text>
              <Text color={textPrimaryColor} wordBreak="break-word">
                {task.id}
              </Text>

              <Text
                color={textSecondaryColor}
                fontWeight={theme.fontWeights.medium}
                textAlign="right"
              >
                Created:
              </Text>
              <Text color={textPrimaryColor} wordBreak="break-word">
                {new Date(task.created_at).toLocaleString()}
              </Text>

              <Text
                color={textSecondaryColor}
                fontWeight={theme.fontWeights.medium}
                textAlign="right"
              >
                Updated:
              </Text>
              <Text color={textPrimaryColor} wordBreak="break-word">
                {task.updated_at
                  ? new Date(task.updated_at).toLocaleString()
                  : "N/A"}
              </Text>

              {task.project_id && (
                <>
                  <Text
                    color={textSecondaryColor}
                    fontWeight={theme.fontWeights.medium}
                    textAlign="right"
                  >
                    Project ID:
                  </Text>
                  <Text color={textPrimaryColor} wordBreak="break-word">
                    {task.project_id}
                  </Text>
                </>
              )}
              {task.agent_id && (
                <>
                  <Text
                    color={textSecondaryColor}
                    fontWeight={theme.fontWeights.medium}
                    textAlign="right"
                  >
                    Agent ID:
                  </Text>
                  <Text color={textPrimaryColor} wordBreak="break-word">
                    {task.agent_id}
                  </Text>
                </>
              )}
            </SimpleGrid>
          </Box>
        </Collapse>

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

        <Modal
          isOpen={isAgentModalOpen}
          onClose={() => setAgentModalOpen(false)}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            bg={bgSurfaceColor}
            color={textPrimaryColor}
            borderWidth="borders.width.xs"
            borderColor={borderDecorativeColor}
            borderRadius="radii.md"
          >
            <ModalHeader
              borderBottomWidth="borders.width.xs"
              borderColor={borderDecorativeColor}
            >
              Assign Agent to: {task.title}
            </ModalHeader>
            <ModalCloseButton
              color={textSecondaryColor}
              _hover={{
                bg: bgInteractiveSubtleHoverColor,
                color: textPrimaryColor,
              }}
            />
            <ModalBody py="spacing.4">
              {agentLoading && <Spinner color="brandPrimary" />}
              {!agentLoading && (
                <List
                  spacing={3}
                  maxH="sizes.menu"
                  overflowY="auto"
                  mt="spacing.2"
                >
                  {storeAgents.map((agent) => (
                    <ListItem
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent)}
                      p="spacing.2"
                      borderRadius="radii.md"
                      fontSize={theme.fontSizes.sm}
                      cursor="pointer"
                      _hover={{ bg: bgInteractiveSubtleHoverColor }}
                      sx={
                        task.agent_id === agent.id
                          ? {
                              bg: coreBlue100,
                              color: coreBlue700,
                              fontWeight: theme.fontWeights.semibold,
                            }
                          : {}
                      }
                    >
                      {agent.name}
                    </ListItem>
                  ))}
                  {storeAgents.length === 0 && (
                    <Text color={textSecondaryColor}>No agents available.</Text>
                  )}
                </List>
              )}
            </ModalBody>
            <ModalFooter
              borderTopWidth="borders.width.xs"
              borderColor={borderDecorativeColor}
            >
              <Button onClick={() => setAgentModalOpen(false)} variant="ghost">
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  },
);

TaskItem.displayName = "TaskItem";

export default TaskItem;
