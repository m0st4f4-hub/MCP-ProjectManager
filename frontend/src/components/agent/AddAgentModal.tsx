"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={{ base: "full", md: "xl" }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Register New Agent</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddAgentForm onSubmit={onSubmit} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddAgentModal;
