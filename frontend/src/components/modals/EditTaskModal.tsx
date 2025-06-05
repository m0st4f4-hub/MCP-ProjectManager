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
import TaskForm from "../forms/TaskForm"; // Assuming TaskForm is correctly located

/**
 * @interface EditTaskModalProps
 * @description Defines the props for the EditTaskModal component.
 * This modal is used to edit the details of an existing task.
 */
interface EditTaskModalProps {
  /** Controls the visibility of the modal. True to show, false to hide. */
  isOpen: boolean;
  /** Callback function invoked when the modal is requested to be closed (e.g., cancel button, overlay click, escape key). */
  onClose: () => void;
  /** 
   * The task object to be edited. If null, the modal will not render,
   * ensuring it only operates when a task is provided.
   */
  task: Task | null;
  /** 
   * Callback function invoked when the user submits the form to save changes.
   * It receives the ID of the task being updated and an object containing the updated task fields.
   */
  onUpdate: (project_id: string, task_number: number, data: TaskUpdateData) => Promise<void>;
}

/**
 * @module EditTaskModal
 * @description
 * A modal dialog component used for editing an existing task.
 * It wraps the `TaskForm` component, providing it with the initial task data
 * and handling the update submission.
 *
 * @example
 * // Assuming taskToEdit is an ITask object and other handlers are defined:
 * <EditTaskModal
 *   isOpen={isEditModalOpen}
 *   onClose={handleCloseEditModal}
 *   task={taskToEdit}
 *   onUpdate={handleUpdateTaskInStore}
 * />
 */
const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen, // Controls modal visibility
  onClose, // Callback for closing the modal
  task, // The task object to edit
  onUpdate, // Callback for submitting updated task data
}) => {
  // If no task is provided, render nothing. This modal is strictly for editing.
  if (!task) return null;

  // Wrapper function for the onUpdate prop to match TaskForm's onSubmit signature.
  // TaskForm's onSubmit expects to pass only the data, but we also need the task.id here.
  const handleUpdate = async (data: TaskUpdateData) => {
    await onUpdate(task.project_id, task.task_number, data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl"> {/* Chakra UI Modal component */}
      <ModalOverlay bg="overlayDefault" /> {/* Background overlay */}
      <ModalContent
        bg="bgModal" // Custom background color from theme
        color="onSurface" // Custom text color from theme
        borderColor="borderDecorative" // Custom border color from theme
        borderWidth="DEFAULT" // Default border width (likely 1px or similar from theme)
      >
        <ModalCloseButton
          color="iconPrimary" // Custom color for close icon
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }} // Hover styles for close button
        />
        <ModalBody pb={6} pt={3}> {/* Modal body with padding */}
          {/* TaskForm is used here in 'edit' mode */}
          <TaskForm
            mode="edit" // Explicitly set mode to 'edit'
            initialData={task} // Pass the current task data to pre-fill the form
            onSubmit={handleUpdate} // Pass the wrapped update handler
            onClose={onClose} // Pass the onClose handler for form cancellation
            submitLabel="Save Changes" // Label for the submit button
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
