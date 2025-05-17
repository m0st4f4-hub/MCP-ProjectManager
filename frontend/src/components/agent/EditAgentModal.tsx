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
import EditAgentForm from "../forms/EditAgentForm"; // Adjusted path
import { Agent } from "@/types";
import { formatDisplayName } from "@/lib/utils";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={{ base: "full", md: "xl" }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Agent: {formatDisplayName(agent.name)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <EditAgentForm agent={agent} onSubmit={onSubmit} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditAgentModal;
