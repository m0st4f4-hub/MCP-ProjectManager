import React from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from '@chakra-ui/react';
import AppIcon from '../common/AppIcon';
import { Project } from '@/types';
import { colorPrimitives } from '@/tokens/colors';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  project: Project | null;
  cancelRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  project,
  cancelRef,
  onClose,
  onConfirm,
}) => (
  <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
    <AlertDialogOverlay backdropFilter="blur(3px)">
      <AlertDialogContent bg="bgSurfaceElevated" color="textPrimary" borderRadius="lg">
        <AlertDialogHeader fontSize="lg" fontWeight="bold" color="text.primary" display="flex" alignItems="center">
          <AppIcon name="delete" boxSize={5} mr={2} />
          {project?.is_archived ? 'Delete Archived Project' : 'Delete Project'}
        </AlertDialogHeader>
        <AlertDialogBody color="text.secondary">
          Are you sure you want to delete the project "{project?.name}"?
          {project?.is_archived
            ? ' This action is permanent and cannot be undone.'
            : ' This will also delete all associated tasks. This action cannot be undone.'}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} variant="outline" borderColor="borderInteractive" leftIcon={<AppIcon name="close" boxSize={4} />} _hover={{ bg: 'bgInteractiveSubtleHover' }}>
            Cancel
          </Button>
          <Button onClick={onConfirm} ml={3} bg="error" color="onError" leftIcon={<AppIcon name="delete" boxSize={4} />} _hover={{ bg: colorPrimitives.red[600] }} _active={{ bg: colorPrimitives.red[700] }}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default DeleteProjectDialog;
