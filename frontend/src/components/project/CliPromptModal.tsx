import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  Button,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import AppIcon from '../common/AppIcon';

interface CliPromptModalProps {
  isOpen: boolean;
  prompt: string;
  projectName: string;
  onCopy: () => void;
  onClose: () => void;
}

const CliPromptModal: React.FC<CliPromptModalProps> = ({
  isOpen,
  prompt,
  projectName,
  onCopy,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered>
    <ModalOverlay backdropFilter="blur(3px)" />
    <ModalContent bg="bgSurfaceElevated" color="textPrimary" borderRadius="lg" maxH="80vh">
      <ModalHeader borderBottomWidth="1px" borderColor="borderDecorative" display="flex" alignItems="center">
        <AppIcon name="terminal" boxSize={5} mr={2} />
        CLI Prompt for: {projectName}
      </ModalHeader>
      <ModalCloseButton _focus={{ boxShadow: 'outline' }} />
      <ModalBody p={6} overflowY="auto">
        <Textarea
          value={prompt}
          isReadOnly
          rows={20}
          fontFamily="monospace"
          fontSize="sm"
          bg="surfaceElevated"
          color="textPrimary"
          borderColor="borderDecorative"
          borderRadius="md"
          p={4}
          whiteSpace="pre-wrap"
        />
      </ModalBody>
      <ModalFooter borderTopWidth="1px" borderColor="borderDecorative">
        <Button variant="ghost" onClick={onCopy} leftIcon={<CopyIcon boxSize={4} />} color="textLink" _hover={{ bg: 'bgInteractiveSubtleHover' }}>
          Copy Prompt
        </Button>
        <Button
          bg="bgInteractive"
          color="textInverse"
          _hover={{ bg: 'bgInteractiveHover' }}
          _active={{ bg: 'bgInteractiveActive' }}
          ml={3}
          leftIcon={<AppIcon name="close" boxSize={4} />}
          onClick={onClose}
        >
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default CliPromptModal;
