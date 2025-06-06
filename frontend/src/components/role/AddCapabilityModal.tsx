'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import AddCapabilityForm from '../forms/AddCapabilityForm';
import type { AgentCapabilityCreateData } from '@/types/agents';

interface AddCapabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentCapabilityCreateData) => Promise<void>;
}

const AddCapabilityModal: React.FC<AddCapabilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => (
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
        <AddCapabilityForm onSubmit={onSubmit} onClose={onClose} />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default AddCapabilityModal;
