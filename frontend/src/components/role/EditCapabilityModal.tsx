'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import EditCapabilityForm from '../forms/EditCapabilityForm';
import type {
  AgentCapability,
  AgentCapabilityUpdateData,
} from '@/types/agents';

interface EditCapabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: AgentCapabilityUpdateData) => Promise<void>;
  capability: AgentCapability | null;
}

const EditCapabilityModal: React.FC<EditCapabilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  capability,
}) => {
  if (!capability) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        bg="bgModal"
        color="onSurface"
        borderColor="borderDecorative"
        borderWidth="DEFAULT"
      >
        <ModalCloseButton
          color="iconPrimary"
          _hover={{ bg: 'interactiveNeutralHover', color: 'iconAccent' }}
        />
        <ModalBody pb={6} pt={3}>
          <EditCapabilityForm
            capability={capability}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditCapabilityModal;
