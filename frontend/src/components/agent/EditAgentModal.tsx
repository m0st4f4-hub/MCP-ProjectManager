"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import EditAgentForm from "../forms/EditAgentForm"; // Adjusted path
import { Agent } from "@/types";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agentId: string, newName: string) => Promise<void>;
  agent: Agent | null;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  agent,
}) => {
  if (!agent) return null;

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
          <EditAgentForm agent={agent} onSubmit={onSubmit} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditAgentModal;
