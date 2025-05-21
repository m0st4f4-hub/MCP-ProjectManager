import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useColorMode,
  Text,
} from "@chakra-ui/react";
import { semanticColors, colorPrimitives } from "@/tokens/colors";
import AppIcon from "./AppIcon";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  bodyText?: string; // Optional body text
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColorScheme?: string;
  isLoading?: boolean; // To show loading state on confirm button
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  bodyText,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonColorScheme = "red",
  isLoading = false,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define semantic colors based on mode
  const modalSurfaceBg = isDark
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

  // Button Colors - default to primary, but adjust if confirmButtonColorScheme suggests danger
  let confirmBtnBg = isDark
    ? semanticColors.primary.dark
    : semanticColors.primary.DEFAULT;
  let confirmBtnColor = isDark
    ? semanticColors.onPrimary.dark
    : semanticColors.onPrimary.DEFAULT;
  let confirmBtnHoverBg = isDark
    ? semanticColors.primaryHover.dark
    : semanticColors.primaryHover.DEFAULT;

  if (confirmButtonColorScheme === "red") {
    confirmBtnBg = isDark
      ? semanticColors.error.dark
      : semanticColors.error.DEFAULT;
    confirmBtnColor = isDark
      ? semanticColors.onError.dark
      : semanticColors.onError.DEFAULT;
    confirmBtnHoverBg = isDark
      ? colorPrimitives.red[500]
      : colorPrimitives.red[600];
  }
  // Add more conditions here if other colorSchemes like 'blue', 'green' are used and need semantic mapping

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={modalSurfaceBg} color={onSurfaceColor}>
        <ModalHeader
          borderBottomWidth="1px"
          borderColor={decorativeBorder}
          display="flex"
          alignItems="center"
        >
          <AppIcon name="warning" boxSize={5} mr={2} />
          {title}
        </ModalHeader>
        <ModalCloseButton
          color={textSecondaryColor}
          _hover={{ bg: interactionHoverBg }}
        />
        <ModalBody py="6">
          {bodyText && (
            <Text fontSize="base" lineHeight="regular" color={onSurfaceColor}>
              {bodyText}
            </Text>
          )}
          {!bodyText && (
            <Text fontSize="base" lineHeight="regular" color={onSurfaceColor}>
              Are you sure you want to proceed with this action?
            </Text>
          )}
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={decorativeBorder}>
          <Button
            variant="ghost"
            onClick={onClose}
            mr={3}
            isDisabled={isLoading}
            color={textSecondaryColor}
            leftIcon={<AppIcon name="close" boxSize={4} />}
          >
            {cancelButtonText}
          </Button>
          <Button
            bg={confirmBtnBg}
            color={confirmBtnColor}
            _hover={{ bg: confirmBtnHoverBg }}
            onClick={onConfirm}
            isLoading={isLoading}
            leftIcon={<AppIcon name="delete" boxSize={4} />}
          >
            {confirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
