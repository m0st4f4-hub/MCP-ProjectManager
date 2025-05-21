import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import AddProjectForm from "../forms/AddProjectForm";
import { ProjectCreateData } from "../../types/project";
import { sizing, blur } from "../../tokens";

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateData) => Promise<void>;
};

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
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
          <AddProjectForm onSubmit={onSubmit} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddProjectModal;
