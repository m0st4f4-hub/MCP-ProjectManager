"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import AddAgentForm from "../forms/AddAgentForm"; // Adjusted path

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="overlayDefault" />
      <ModalContent
        bg="bgModal"
        color="onSurface"
        borderColor="borderDecorative"
        borderWidth="DEFAULT"
      >
        <ModalCloseButton
          color="iconPrimary"
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }}
        />
        <ModalBody pb={6} pt={3}>
          <AddAgentForm onSubmit={onSubmit} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddAgentModal;
