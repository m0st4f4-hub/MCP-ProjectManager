import * as logger from '@/utils/logger';
import React from "react";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import {
  EditIcon as ChakraEditIcon,
  DeleteIcon as ChakraDeleteIcon,
  CopyIcon as ChakraCopyIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { StatusID } from "@/lib/statusUtils";
import { LucideArchive } from "lucide-react"; // Using Lucide for a modern archive icon

/**
 * @interface TaskActionsMenuProps
 * @description Defines the props for the TaskActionsMenu component.
 * This menu provides a set of common actions that can be performed on a task.
 */
interface TaskActionsMenuProps {
  /** Callback function invoked when the 'Edit' action is selected. */
  onEdit: () => void;
  /** Callback function invoked when the 'Delete' action is selected. */
  onDelete: () => void;
  /** Optional: Callback for duplicating the task. If not provided, the option is hidden. */
  onDuplicate?: () => void;
  /** Optional: Callback for archiving/unarchiving the task. If not provided, the option is hidden. */
  onArchive?: () => void;
  /** Optional: Callback for changing the task's status. Passes the new StatusID. */
  onStatusChange?: (status: StatusID) => void;
  /** Optional: Array of StatusIDs that the task can be changed to. Defaults to an empty array. */
  availableStatuses?: StatusID[];
  /** Optional: If true, actions like Edit, Delete, Duplicate, Archive are disabled. Defaults to false. */
  isArchived?: boolean;
  /** Optional: If true, the menu button shows a loading spinner. Defaults to false. */
  isLoading?: boolean;
}

// Custom ArchiveIcon component using Lucide for consistency if other icons are Lucide based.
const ArchiveIcon = (props: React.ComponentProps<typeof LucideArchive>) => (
  <LucideArchive {...props} />
);

/**
 * @module TaskActionsMenu
 * @description
 * A reusable dropdown menu component that provides a list of actions
 * applicable to a task, such as Edit, Delete, Duplicate, Archive, and Set Status.
 * This component is typically triggered by a kebab menu or ellipsis icon on a task item.
 *
 * @example
 * <TaskActionsMenu
 *   onEdit={() => logger.info('Edit clicked')}
 *   onDelete={() => logger.info('Delete clicked')}
 *   onDuplicate={() => logger.info('Duplicate clicked')}
 *   onArchive={() => logger.info('Archive clicked')}
 *   onStatusChange={(newStatus) => logger.info('Change status to', newStatus)}
 *   availableStatuses={['TO_DO', 'IN_PROGRESS', 'COMPLETED']}
 *   isArchived={false}
 *   isLoading={false}
 * />
 */
const TaskActionsMenu: React.FC<TaskActionsMenuProps> = ({
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onStatusChange,
  availableStatuses = [], // Default to empty array if not provided
  isArchived = false, // Default to false
  isLoading = false, // Default to false
}) => {
  return (
    <Menu>
      {/* Tooltip provides context for the menu button */}
      <Tooltip label="Actions" openDelay={400}>
        <MenuButton
          as={IconButton} // Renders the MenuButton as an IconButton
          aria-label="Task Actions" // Accessibility label
          icon={<ChevronDownIcon />} // Icon for the dropdown indicator
          size="sm" // Small size for the button
          variant="ghost" // Ghost variant for less visual clutter
          isLoading={isLoading} // Show spinner if isLoading is true
        />
      </Tooltip>
      <MenuList zIndex="popover"> {/* Ensure menu appears above other content */}
        {/* Edit Action */}
        <MenuItem icon={<ChakraEditIcon />} onClick={onEdit} isDisabled={isArchived}>
          Edit
        </MenuItem>
        {/* Delete Action - typically styled differently to indicate a destructive action */}
        <MenuItem icon={<ChakraDeleteIcon />} onClick={onDelete} color="error" isDisabled={isArchived}>
          Delete
        </MenuItem>

        {/* Duplicate Action - only rendered if onDuplicate callback is provided */}
        {onDuplicate && (
          <MenuItem icon={<ChakraCopyIcon />} onClick={onDuplicate} isDisabled={isArchived}>
            Duplicate
          </MenuItem>
        )}

        {/* Archive Action - only rendered if onArchive callback is provided */}
        {onArchive && (
          <MenuItem icon={<ArchiveIcon />} onClick={onArchive} isDisabled={isArchived}>
            {/* Dynamically set label based on isArchived status if needed, though current props don't indicate unarchive functionality here */}
            Archive 
          </MenuItem>
        )}

        {/* Divider to separate general actions from status change actions */}
        <MenuDivider />

        {/* Sub-header for status change options - not interactive itself */}
        <MenuItem isDisabled={true} color="textSecondary">
          Set Status to...
        </MenuItem>

        {/* Status Change Actions - rendered if onStatusChange and availableStatuses are provided */}
        {onStatusChange &&
          availableStatuses.map((statusId) => (
            <MenuItem key={statusId} onClick={() => onStatusChange(statusId)}>
              {statusId} {/* Display the StatusID as the menu item label */}
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  );
};

export default TaskActionsMenu;