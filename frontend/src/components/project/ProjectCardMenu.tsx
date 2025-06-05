import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CopyIcon as ChakraCopyIcon,
  RepeatClockIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import { Edit3, Trash2, Archive as LucideArchive } from 'lucide-react';
import AppIcon from '../common/AppIcon';
import { Project, ProjectWithMeta } from '@/types';

const ArchiveIcon = (props: React.ComponentProps<typeof LucideArchive>) => (
  <LucideArchive {...props} />
);

interface ProjectCardMenuProps {
  project: ProjectWithMeta;
  onEdit: (project: ProjectWithMeta) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (project: Project) => void;
  onCopyGet: (id: string) => void;
  onOpenCliPrompt: (project: ProjectWithMeta) => void;
  disableActions: boolean;
}

const ProjectCardMenu: React.FC<ProjectCardMenuProps> = ({
  project,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onCopyGet,
  onOpenCliPrompt,
  disableActions,
}) => (
  <Menu autoSelect={false}>
    <MenuButton
      as={IconButton}
      aria-label="Project options"
      icon={<HamburgerIcon />}
      variant="ghost"
      size="sm"
      color={project.is_archived ? 'iconDisabled' : 'iconSecondary'}
      _hover={{
        bg: project.is_archived ? 'transparent' : 'interactiveNeutralHover',
        color: project.is_archived ? 'iconDisabled' : 'iconAccent',
      }}
      isDisabled={disableActions}
      zIndex="docked"
    />
    <MenuList bg="bgPopover" borderColor="borderOverlay" zIndex="popover">
      <MenuItem
        icon={<AppIcon component={Edit3} boxSize="1.1rem" color="currentColor" />}
        onClick={() => onEdit(project)}
        isDisabled={project.is_archived}
        color="textSecondary"
        _hover={{ bg: 'interactiveNeutralHover', color: 'textPrimary' }}
      >
        Edit Details
      </MenuItem>
      <MenuItem
        icon={<AppIcon component={ChakraCopyIcon} boxSize="1.1rem" color="currentColor" />}
        onClick={() => onCopyGet(project.id)}
        color="textSecondary"
        _hover={{ bg: 'interactiveNeutralHover', color: 'textPrimary' }}
      >
        Copy Get Command
      </MenuItem>
      <MenuItem
        icon={<AppIcon component={CopyIcon} boxSize="1.1rem" color="currentColor" />}
        onClick={() => onOpenCliPrompt(project)}
        color="textSecondary"
        _hover={{ bg: 'interactiveNeutralHover', color: 'textPrimary' }}
      >
        View Full CLI Prompt
      </MenuItem>
      {project.is_archived ? (
        <MenuItem
          icon={<RepeatClockIcon boxSize={4} />}
          onClick={() => onUnarchive(project.id)}
          color="textPrimary"
        >
          Unarchive Project
        </MenuItem>
      ) : (
        <MenuItem
          icon={<AppIcon component={ArchiveIcon} boxSize={4} />}
          onClick={() => onArchive(project.id)}
          color="textPrimary"
          _hover={{ bg: 'bgInteractiveSubtleHover' }}
        >
          Archive Project
        </MenuItem>
      )}
      <MenuItem
        icon={<AppIcon component={Trash2} boxSize={4} color="textError" />}
        onClick={() => onDelete(project)}
        color="textError"
        _hover={{ bg: 'errorBgSubtle', color: 'textStatusError' }}
      >
        Delete Project
      </MenuItem>
    </MenuList>
  </Menu>
);

export default ProjectCardMenu;
