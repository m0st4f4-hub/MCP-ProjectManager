'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import AddRoleForm from '../forms/AddRoleForm';
import type { AgentRoleCreateData } from '@/types/agent_role';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentRoleCreateData) => Promise<void>;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
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
        <AddRoleForm onSubmit={onSubmit} onClose={onClose} />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default AddRoleModal;
