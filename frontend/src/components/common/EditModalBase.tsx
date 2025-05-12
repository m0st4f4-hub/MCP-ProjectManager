import React, { useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  VStack,
  Text,
} from '@chakra-ui/react';

// Define a generic constraint for entity data
// Ensure it has an 'id' and allows accessing a display field via string key
type EntityWithIdAndName = { id: number | string; [key: string]: unknown };

interface EditModalBaseProps<T extends EntityWithIdAndName> {
  isOpen: boolean;
  onClose: () => void;
  entityName: string; // e.g., "Project", "Scope"
  entityData: T | null;
  entityDisplayField: keyof T; // Field to display in header/delete confirmation (e.g., 'name')
  children: React.ReactNode; // The specific form fields for the entity
  onSave: () => Promise<void>; // Caller handles data preparation and API call
  onDelete?: () => Promise<void>; // Caller handles API call
  isLoadingSave: boolean; // Loading state controlled by the caller
  isLoadingDelete?: boolean; // Loading state controlled by the caller
  size?: string; // Optional modal size
  hideDeleteButton?: boolean; // Option to hide delete button
}

function EditModalBase<T extends EntityWithIdAndName>({
  isOpen,
  onClose,
  entityName,
  entityData,
  entityDisplayField,
  children,
  onSave,
  onDelete,
  isLoadingSave,
  isLoadingDelete = false, // Default to false if onDelete is not provided
  size = 'lg',
  hideDeleteButton = false,
}: EditModalBaseProps<T>) {
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const entityDisplayName = entityData ? String(entityData[entityDisplayField]) : '';

  const handleSave = async () => {
    try {
      await onSave();
      // Success toast can be handled by the caller after successful API call if more context is needed
      // toast({
      //   title: `${entityName} updated.`,
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true,
      // });
      // onClose(); // Caller should handle closing on successful save
    } catch (error: unknown) {
       console.error(`Failed to update ${entityName}:`, error);
       // Error toast should be handled by the caller as they have more error context
      // toast({
      //   title: 'Update failed.',
      //   description: error.message || `Could not update the ${entityName}.`,
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      // });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete || !entityData) return;
    try {
      await onDelete();
      // Success toast can be handled by the caller
      // toast({
      //   title: `${entityName} deleted.`,
      //   status: 'info',
      //   duration: 3000,
      //   isClosable: true,
      // });
      onAlertClose();
      // onClose(); // Caller should handle closing
    } catch (error: unknown) {
      console.error(`Failed to delete ${entityName}:`, error);
       // Error toast handled by caller
      // toast({
      //   title: 'Deletion failed.',
      //   description: error.message || `Could not delete the ${entityName}.`,
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      // });
    }
  };

  if (!entityData) return null; // Don't render if no entity data is provided

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={size}>
        <ModalOverlay />
        <ModalContent bg="bg.surface" color="text.primary">
          <ModalHeader borderBottomWidth="1px" borderColor="border.base">
            Edit {entityName}: {entityDisplayName}
          </ModalHeader>
          <ModalCloseButton color="text.secondary" _hover={{ bg: "interaction.hover"}}/>
          <ModalBody pb={6} pt={4}>
            {/* Render the specific form fields passed as children */}
            <VStack spacing={4} align="stretch">
                {children}
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor="border.base">
            <Flex justify="space-between" width="100%">
              {!hideDeleteButton && onDelete ? (
                <Button
                  variant="outline"
                  color="status.error"
                  borderColor="status.error"
                  _hover={{ bg: "bg.danger.subtle" }}
                  onClick={onAlertOpen}
                  isLoading={isLoadingDelete}
                  loadingText="Deleting..."
                >
                  Delete
                </Button>
              ) : <div />}
              <Flex>
                <Button variant="ghost" onClick={onClose} mr={3} isDisabled={isLoadingSave || isLoadingDelete} color="text.secondary">
                  Cancel
                </Button>
                <Button
                  bg="bg.button.primary"
                  color="text.button.primary"
                  _hover={{ bg: "bg.button.primary.hover" }}
                  onClick={handleSave}
                  isLoading={isLoadingSave}
                  loadingText="Saving..."
                  isDisabled={isLoadingDelete}
                >
                  Save Changes
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {onDelete && (
          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onAlertClose}
            isCentered
          >
          <AlertDialogOverlay>
            <AlertDialogContent bg="bg.surface" color="text.primary">
              <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" borderColor="border.base">
                Delete {entityName}
              </AlertDialogHeader>
              <AlertDialogBody py={4}>
                Are you sure you want to delete the {entityName.toLowerCase()} &quot;<Text as="span" fontWeight="bold" color="status.error">{entityDisplayName}</Text>&quot;? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter borderTopWidth="1px" borderColor="border.base">
                <Button variant="ghost" ref={cancelRef} onClick={onAlertClose} isDisabled={isLoadingDelete} color="text.secondary">
                  Cancel
                </Button>
                <Button 
                    bg="bg.button.danger"
                    color="text.button.primary"
                    _hover={{ bg: "bg.danger.hover" }}
                    onClick={handleDeleteConfirm} 
                    ml={3} 
                    isLoading={isLoadingDelete} 
                    loadingText="Deleting..."
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </>
  );
}

export default EditModalBase; 