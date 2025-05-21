// D:\mcp\task-manager\frontend\src\components\EditTaskModal.tsx
"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { Task, TaskUpdateData } from "@/types";
import TaskForm from "../forms/TaskForm";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (id: string, data: TaskUpdateData) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
}) => {
  if (!task) return null;

  const handleUpdate = async (data: TaskUpdateData) => {
    await onUpdate(task.id, data);
  };

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
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }}
        />
        <ModalBody pb={6} pt={3}>
          <TaskForm
            mode="edit"
            initialData={task}
            onSubmit={handleUpdate}
            onClose={onClose}
            submitLabel="Save Changes"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
