// D:\\mcp\\task-manager\\frontend\\src\\components\\AddTaskForm.tsx
"use client";

import React from "react";
import { useTaskStore } from "@/store/taskStore";
import { TaskCreateData } from "@/types";
import TaskForm from "./TaskForm";

// Task ID: <taskId_placeholder>
// Agent Role: PresentationLayerSpecialist
// Request ID: <requestId_placeholder>
// Timestamp: <timestamp_placeholder>

const AddTaskForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const addTask = useTaskStore((state) => state.addTask);

  const handleAdd = async (data: unknown) => {
    if (
      typeof data === "object" &&
      data !== null &&
      "title" in data &&
      "status" in data &&
      "project_id" in data
    ) {
      const taskData = data as TaskCreateData;
      await addTask(taskData);
    }
  };

  return (
    <TaskForm
      mode="add"
      onSubmit={handleAdd}
      onClose={onClose}
      submitLabel="Add Task"
    />
  );
};

export default AddTaskForm;
