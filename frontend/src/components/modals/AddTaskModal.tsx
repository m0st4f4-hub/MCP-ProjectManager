import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import AddTaskForm from '../forms/AddTaskForm';
import { sizing, blur } from '../../tokens';

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter={`blur(${blur.xs})`} bg="overlayDefault" />
      <ModalContent
        bg="bgModal"
        color="onSurface"
        borderColor="borderDecorative"
        borderWidth={sizing.borderWidth.DEFAULT}
      >
        <ModalCloseButton
          color="iconPrimary"
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }}
        />
        <ModalBody pb={6} pt={3}>
          <AddTaskForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddTaskModal; 