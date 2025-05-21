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
import { LucideArchive } from "lucide-react";

interface TaskActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onStatusChange?: (status: StatusID) => void;
  availableStatuses?: StatusID[];
  isArchived?: boolean;
  isLoading?: boolean;
}

const ArchiveIcon = (props: React.ComponentProps<typeof LucideArchive>) => (
  <LucideArchive {...props} />
);

const TaskActionsMenu: React.FC<TaskActionsMenuProps> = ({
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onStatusChange,
  availableStatuses = [],
  isArchived = false,
  isLoading = false,
}) => {
  return (
    <Menu>
      <Tooltip label="Actions" openDelay={400}>
        <MenuButton
          as={IconButton}
          aria-label="Task Actions"
          icon={<ChevronDownIcon />}
          size="sm"
          variant="ghost"
          isLoading={isLoading}
        />
      </Tooltip>
      <MenuList zIndex="popover">
        <MenuItem icon={<ChakraEditIcon />} onClick={onEdit} isDisabled={isArchived}>
          Edit
        </MenuItem>
        <MenuItem icon={<ChakraDeleteIcon />} onClick={onDelete} color="error" isDisabled={isArchived}>
          Delete
        </MenuItem>
        {onDuplicate && (
          <MenuItem icon={<ChakraCopyIcon />} onClick={onDuplicate} isDisabled={isArchived}>
            Duplicate
          </MenuItem>
        )}
        {onArchive && (
          <MenuItem icon={<ArchiveIcon />} onClick={onArchive} isDisabled={isArchived}>
            Archive
          </MenuItem>
        )}
        <MenuDivider />
        <MenuItem isDisabled={true} color="textSecondary">
          Set Status to...
        </MenuItem>
        {onStatusChange &&
          availableStatuses.map((statusId) => (
            <MenuItem key={statusId} onClick={() => onStatusChange(statusId)}>
              {statusId}
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  );
};

export default TaskActionsMenu; 