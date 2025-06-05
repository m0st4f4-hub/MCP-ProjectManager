import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import TaskForm from "../forms/TaskForm";
import { TaskCreateData } from "@/types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: TaskCreateData) => Promise<void>;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const handleAdd = async (data: unknown) => {
    if (
      typeof data === "object" &&
      data !== null &&
      "title" in data &&
      "status" in data &&
      "project_id" in data
    ) {
      await onAdd(data as TaskCreateData);
    }
  };

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
          <TaskForm
            mode="add"
            onSubmit={handleAdd}
            onClose={onClose}
            submitLabel="Add Task"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddTaskModal;
