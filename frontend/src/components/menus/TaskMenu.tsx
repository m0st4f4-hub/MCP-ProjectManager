import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Icon,
  useTheme,
  useToken,
  IconButtonProps, // For MenuButton's 'as' prop
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
import { RiListOrdered as ListOrderedIcon } from "react-icons/ri";
import AppIcon from "../../common/AppIcon"; // Adjusted path
import { Task, StatusID } from "@/types";
import { getDisplayableStatus } from "@/lib/statusUtils";

interface TaskMenuProps {
  task: Task;
  availableStatuses: StatusID[];
  // currentStatusIconName: React.ElementType | string | undefined; // Not directly needed for MenuButton icon, which is fixed
  onStatusChange: (newStatus: StatusID) => void;
  onOpenEditTaskModal: () => void;
  onCopyGetCommand?: (taskId: string) => void;
  onCopyDetailedPrompt: () => void;
  onArchiveTask: () => void;
  onUnarchiveTask: () => void;
  onDeleteInitiate: (task: Task) => void;
}

const TaskMenu: React.FC<TaskMenuProps> = ({
  task,
  availableStatuses,
  onStatusChange,
  onOpenEditTaskModal,
  onCopyGetCommand,
  onCopyDetailedPrompt,
  onArchiveTask,
  onUnarchiveTask,
  onDeleteInitiate,
}) => {
  const theme = useTheme();
  const [
    textPrimaryColor,
    textSecondaryColor,
    textDisabledColor,
    bgSurfaceColor,
    bgInteractiveSubtleHoverColor,
    borderDecorativeColor,
    menuButtonHoverIconColor,
    coreRed50,
    coreRed600,
    coreRed700,
    archiveHoverBgColor,
    archiveHoverIconColor,
    unarchiveHoverBgColor,
    unarchiveHoverIconColor,
  ] = useToken("colors", [
    "textPrimary",
    "textSecondary",
    "textDisabled",
    "bgSurface",
    "bgInteractiveSubtleHover",
    "borderDecorative",
    "orange.500", // Default hover for menu button (repeatclock)
    "red.50",
    "red.600",
    "red.700",
    "yellow.50", // Example, adjust as needed
    "yellow.600", // Example, adjust as needed
    "green.50", // Example, adjust as needed
    "green.600", // Example, adjust as needed
  ]);

  const iconMap: Record<string, React.ElementType> = {
    EditIcon: ChakraEditIcon,
    TimeIcon: ChakraTimeIcon,
    WarningTwoIcon: ChakraWarningTwoIcon,
    CheckCircleIcon: ChakraCheckCircleIcon,
    InfoOutlineIcon: ChakraInfoOutlineIcon,
    ListOrderedIcon: ListOrderedIcon,
    RepeatClockIcon: ChakraRepeatClockIcon,
    QuestionOutlineIcon: ChakraQuestionOutlineIcon,
    CheckIcon: ChakraCheckIcon,
    NotAllowedIcon: ChakraNotAllowedIcon,
    EmailIcon: ChakraEmailIcon,
    CopyIcon: ChakraCopyIcon,
  };

  const currentTextColor = task.is_archived ? textDisabledColor : textPrimaryColor;

  const menuItemsBaseStyle = {
    fontSize: theme.fontSizes.sm,
    px: "spacing.3",
    py: "spacing.2",
    gap: "spacing.2",
    borderRadius: "radii.sm",
    mx: "spacing.1",
  };

  return (
    <Menu placement="bottom-end">
      <Tooltip label="Change Status or More Actions" placement="top">
        <MenuButton
          as={IconButton}
          aria-label="Change task status or more actions"
          icon={<AppIcon name="repeatclock" />}
          onClick={(e) => {
            e.stopPropagation();
          }}
          size="sm"
          variant="ghost"
          color={currentTextColor}
          _hover={{
            bg: bgInteractiveSubtleHoverColor,
            color: menuButtonHoverIconColor,
          }}
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
        zIndex="popover"
      >
        {availableStatuses.map((statusId) => {
          const sInfo = getDisplayableStatus(statusId);
          const ResolvedStatusIcon =
            typeof sInfo?.icon === "string"
              ? iconMap[sInfo.icon]
              : sInfo?.icon;
          return (
            <MenuItem
              key={statusId}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(statusId);
              }}
              icon={
                ResolvedStatusIcon ? <Icon as={ResolvedStatusIcon} /> : undefined
              }
              sx={{
                ...menuItemsBaseStyle,
                color: textPrimaryColor,
                _hover: { bg: bgInteractiveSubtleHoverColor },
              }}
            >
              {sInfo?.displayName || statusId}
            </MenuItem>
          );
        })}
        <MenuItem
          icon={<AppIcon icon={ChakraEditIcon} size="1rem" />}
          onClick={(e) => {
            e.stopPropagation();
            onOpenEditTaskModal();
          }}
          sx={{
            ...menuItemsBaseStyle,
            color: textSecondaryColor,
            _hover: { bg: bgInteractiveSubtleHoverColor, color: textPrimaryColor },
          }}
        >
          Edit Full Task
        </MenuItem>
        {onCopyGetCommand && (
          <MenuItem
            icon={<AppIcon icon={ChakraCopyIcon} size="1rem" />}
            onClick={(e) => {
              e.stopPropagation();
              onCopyGetCommand(task.id);
            }}
            sx={{
              ...menuItemsBaseStyle,
              color: textSecondaryColor,
              _hover: { bg: bgInteractiveSubtleHoverColor, color: textPrimaryColor },
            }}
          >
            Copy Get Command
          </MenuItem>
        )}
        <MenuItem
          icon={<AppIcon icon={ChakraCopyIcon} size="1rem" />}
          onClick={(e) => {
            e.stopPropagation();
            onCopyDetailedPrompt();
          }}
          sx={{
            ...menuItemsBaseStyle,
            color: textSecondaryColor,
            _hover: { bg: bgInteractiveSubtleHoverColor, color: textPrimaryColor },
          }}
        >
          Copy Detailed Prompt
        </MenuItem>
        {task.is_archived ? (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onUnarchiveTask();
            }}
            icon={<AppIcon name="download" transform="rotate(180deg)" />}
            sx={{
              ...menuItemsBaseStyle,
              color: textPrimaryColor, // Or a specific "unarchive" color
              _hover: { bg: unarchiveHoverBgColor, color: unarchiveHoverIconColor },
            }}
          >
            Unarchive Task
          </MenuItem>
        ) : (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onArchiveTask();
            }}
            icon={<AppIcon name="download" />}
            sx={{
              ...menuItemsBaseStyle,
              color: textPrimaryColor, // Or a specific "archive" color
              _hover: { bg: archiveHoverBgColor, color: archiveHoverIconColor },
            }}
          >
            Archive Task
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDeleteInitiate(task);
          }}
          icon={<AppIcon name="delete" />}
          sx={{
            ...menuItemsBaseStyle,
            color: coreRed600,
            _hover: { bg: coreRed50, color: coreRed700 },
          }}
        >
          Delete Task
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default TaskMenu;
