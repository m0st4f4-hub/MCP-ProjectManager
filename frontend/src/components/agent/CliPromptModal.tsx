import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@chakra-ui/react";
import AppIcon from "../common/AppIcon";
import { colorPrimitives } from "@/tokens/colors";

interface CliPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliPromptText: string;
  agentName?: string;
}

const CliPromptModal: React.FC<CliPromptModalProps> = ({
  isOpen,
  onClose,
  cliPromptText,
  agentName,
}) => {
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(cliPromptText);
    } catch {
      // Optionally handle error
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(3px)" bg="overlayDefault" />
      <ModalContent
        bg="bgSurfaceElevated"
        color="textPrimary"
        borderRadius="lg"
        maxH="80vh"
      >
        <ModalHeader borderBottomWidth="1px" borderColor="borderDecorative">
          CLI Prompt{agentName ? ` for: ${agentName}` : ""}
        </ModalHeader>
        <ModalCloseButton _focus={{ boxShadow: "outline" }} />
        <ModalBody p={6} overflowY="auto">
          <Textarea
            value={cliPromptText}
            isReadOnly
            rows={20}
            fontFamily="monospace"
            fontSize="sm"
            bg={colorPrimitives.gray[50]}
            color={colorPrimitives.gray[900]}
            borderColor="borderDecorative"
            _dark={{
              bg: colorPrimitives.gray[900],
              color: colorPrimitives.gray[100],
              borderColor: colorPrimitives.gray[700],
            }}
            borderRadius="md"
            p={4}
            whiteSpace="pre-wrap"
          />
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="borderDecorative">
          <Button
            variant="ghost"
            onClick={handleCopyPrompt}
            leftIcon={<AppIcon name="copy" />}
            color="textLink"
            _hover={{ bg: "bgInteractiveSubtleHover" }}
          >
            Copy Prompt
          </Button>
          <Button
            bg="bgInteractive"
            color="textInverse"
            _hover={{ bg: "bgInteractiveHover" }}
            _active={{ bg: "bgInteractiveActive" }}
            ml={3}
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CliPromptModal;
