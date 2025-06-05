import * as logger from '@/utils/logger';
import React, { useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Text,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { semanticColors, colorPrimitives } from "@/tokens/colors";
import AppIcon from "./AppIcon";

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
  size = "lg",
  hideDeleteButton = false,
}: EditModalBaseProps<T>) {
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define semantic colors based on mode
  const surfaceBg = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;
  const onSurfaceColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  const decorativeBorder = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;
  const textSecondaryColor = isDark
    ? semanticColors.textSecondary.dark
    : semanticColors.textSecondary.DEFAULT;
  const interactionHoverBg = isDark
    ? semanticColors.surfaceElevated.dark
    : semanticColors.surfaceElevated.DEFAULT;

  const errorColor = isDark
    ? semanticColors.error.dark
    : semanticColors.error.DEFAULT;
  const errorBgSubtle = isDark
    ? semanticColors.errorBgSubtle.dark
    : semanticColors.errorBgSubtle.DEFAULT;

  const primaryButtonBg = isDark
    ? semanticColors.primary.dark
    : semanticColors.primary.DEFAULT;
  const onPrimaryButtonColor = isDark
    ? semanticColors.onPrimary.dark
    : semanticColors.onPrimary.DEFAULT;
  const primaryButtonHoverBg = isDark
    ? semanticColors.primaryHover.dark
    : semanticColors.primaryHover.DEFAULT;

  const dangerButtonBg = isDark
    ? semanticColors.error.dark
    : semanticColors.error.DEFAULT; // Main background for danger button
  const onDangerButtonColor = isDark
    ? semanticColors.onError.dark
    : semanticColors.onError.DEFAULT;
  // For hover on danger button, using a slightly darker primitive or a specific semantic token if available
  const dangerButtonHoverBg = isDark
    ? colorPrimitives.red[500]
    : colorPrimitives.red[600];

  const entityDisplayName = entityData
    ? String(entityData[entityDisplayField])
    : "";

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error: unknown) {
      logger.error(`Failed to update ${entityName}:`, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete || !entityData) return;
    try {
      await onDelete();
      onAlertClose();
    } catch (error: unknown) {
      logger.error(`Failed to delete ${entityName}:`, error);
    }
  };

  if (!entityData) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={size}>
        <ModalOverlay />
        <ModalContent bg={surfaceBg} color={onSurfaceColor}>
          <ModalHeader
            borderBottomWidth="1px"
            borderColor={decorativeBorder}
            display="flex"
            alignItems="center"
          >
            <AppIcon name="edit" boxSize={5} mr={2} />
            Edit {entityName}: {entityDisplayName}
          </ModalHeader>
          <ModalCloseButton
            color={textSecondaryColor}
            _hover={{ bg: interactionHoverBg }}
          />
          <ModalBody>
            <div>{children}</div>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor={decorativeBorder}>
            <Flex justify="space-between" w="full">
              {!hideDeleteButton && onDelete ? (
                <Button
                  variant="outline"
                  color={errorColor}
                  borderColor={errorColor}
                  _hover={{ bg: errorBgSubtle, color: errorColor }}
                  onClick={onAlertOpen}
                  isLoading={isLoadingDelete}
                  loadingText="Deleting..."
                  leftIcon={<AppIcon name="delete" boxSize={4} />}
                >
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  mr={3}
                  isDisabled={isLoadingSave || isLoadingDelete}
                  color={textSecondaryColor}
                  leftIcon={<AppIcon name="close" boxSize={4} />}
                >
                  Cancel
                </Button>
                <Button
                  bg={primaryButtonBg}
                  color={onPrimaryButtonColor}
                  _hover={{ bg: primaryButtonHoverBg }}
                  onClick={handleSave}
                  isLoading={isLoadingSave}
                  loadingText="Saving..."
                  isDisabled={isLoadingDelete}
                  leftIcon={<AppIcon name="save" boxSize={4} />}
                >
                  Save Changes
                </Button>
              </div>
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
            <AlertDialogContent bg={surfaceBg} color={onSurfaceColor}>
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                borderBottomWidth="1px"
                borderColor={decorativeBorder}
                display="flex"
                alignItems="center"
              >
                <AppIcon name="delete" boxSize={5} mr={2} />
                Delete {entityName}
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete the {entityName.toLowerCase()}{" "}
                &quot;
                <Text as="span" fontWeight="bold">
                  {entityDisplayName}
                </Text>
                &quot;? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter
                borderTopWidth="1px"
                borderColor={decorativeBorder}
              >
                <Button
                  variant="ghost"
                  ref={cancelRef}
                  onClick={onAlertClose}
                  isDisabled={isLoadingDelete}
                  color={textSecondaryColor}
                  leftIcon={<AppIcon name="close" boxSize={4} />}
                >
                  Cancel
                </Button>
                <Button
                  bg={dangerButtonBg}
                  color={onDangerButtonColor}
                  _hover={{ bg: dangerButtonHoverBg }}
                  onClick={handleDeleteConfirm}
                  ml={3}
                  isLoading={isLoadingDelete}
                  loadingText="Deleting..."
                  leftIcon={<AppIcon name="delete" boxSize={4} />}
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
