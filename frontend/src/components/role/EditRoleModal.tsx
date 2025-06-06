'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import EditRoleForm from '../forms/EditRoleForm';
import type { AgentRole, AgentRoleUpdateData } from '@/types/agent_role';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: AgentRoleUpdateData) => Promise<void>;
  role: AgentRole | null;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  role,
}) => {
  if (!role) return null;
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
          <EditRoleForm role={role} onSubmit={onSubmit} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditRoleModal;
