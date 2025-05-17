// D:\mcp\task-manager\frontend\src\components\EditTaskModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  ModalHeader,
  ModalBody,
  VStack,
} from "@chakra-ui/react";
import { Task, TaskUpdateData, TaskStatus } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import EditModalBase from "../common/EditModalBase";
import AppIcon from '../common/AppIcon';
import { sizing, typography, shadows } from "@/tokens";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<TaskStatus | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const projects = useTaskStore((state) => state.projects);
  const agents = useTaskStore((state) => state.agents);

  const isTaskTerminal = task?.status === TaskStatus.COMPLETED || task?.status === TaskStatus.FAILED;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setProjectId(task.project_id?.toString() || "");
      setAgentName(task.agent_name || "");
      setCurrentStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setProjectId("");
      setAgentName("");
      setCurrentStatus(undefined);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!task) return;
    setIsLoading(true);
    const updateData: TaskUpdateData = {
      title,
      description: description || undefined,
      project_id: projectId ? projectId : undefined,
      agent_name: agentName || undefined,
      status: currentStatus,
    };

    try {
      await onUpdate(task.id, updateData);
      toast({
        title: "Task updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      console.error("Failed to update task:", error);
      const message =
        error instanceof Error ? error.message : "Could not update the task.";
      toast({
        title: "Update failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!task) return null;

  const formControlStyles = {
    mb: sizing.spacing[4],
  };

  const formLabelStyles = {
    color: "textSecondary",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    mb: sizing.spacing[1],
    display: "flex",
    alignItems: "center",
  };

  const formInputBaseStyles = {
    bg: "bgInput",
    color: "textInput",
    borderWidth: sizing.borderWidth.DEFAULT,
    borderStyle: "solid",
    borderColor: "borderInteractive",
    borderRadius: sizing.borderRadius.md,
    px: sizing.spacing[3],
    py: sizing.spacing[2],
    fontSize: typography.fontSize.sm,
    width: "100%",
    boxSizing: "border-box",
    h: sizing.height.md,
    _hover: { borderColor: "borderHover" },
    _focus: {
      borderColor: "borderFocused",
      boxShadow: shadows.outline,
      outline: "none",
    },
    _placeholder: { color: "textPlaceholder", fontStyle: "italic" },
  };

  const formTextareaStyles = {
    ...formInputBaseStyles,
    h: "auto",
    minH: sizing.spacing[24],
    pt: sizing.spacing[2],
    pb: sizing.spacing[2],
  };

  const readOnlyInputStyles = {
    ...formInputBaseStyles,
    bg: "bgDisabled",
    color: "textDisabled",
    borderColor: "borderDisabled",
    opacity: 0.7,
    cursor: "not-allowed",
    _hover: { borderColor: "borderDisabled" },
    _focus: { boxShadow: "none", borderColor: "borderDisabled" },
  };
  
  const readOnlyTextareaStyles = {
    ...formTextareaStyles,
    bg: "bgDisabled",
    color: "textDisabled",
    borderColor: "borderDisabled",
    opacity: 0.7,
    cursor: "not-allowed",
    _hover: { borderColor: "borderDisabled" },
    _focus: { boxShadow: "none", borderColor: "borderDisabled" },
  };

  return (
    <EditModalBase<Task>
      isOpen={isOpen}
      onClose={onClose}
      entityName="Task"
      entityData={task}
      entityDisplayField="title"
      onSave={handleSave}
      isLoadingSave={isLoading}
      size="xl"
      hideDeleteButton={true}
    >
      <ModalHeader 
        borderBottomWidth={sizing.borderWidth.DEFAULT} 
        borderColor="borderDecorative"
        display="flex" 
        alignItems="center"
        fontSize={typography.fontSize.lg}
        fontWeight={typography.fontWeight.semibold}
        py={sizing.spacing[3]}
      >
        <AppIcon name="edit" boxSize={5} mr={sizing.spacing[2]} />
        Edit Task: {task.title}
      </ModalHeader>
      <ModalBody py={sizing.spacing[5]}>
        <VStack spacing={sizing.spacing[4]} align="stretch">
          <FormControl {...formControlStyles} isReadOnly={isTaskTerminal}>
            <FormLabel sx={formLabelStyles}>
              <AppIcon name="title" boxSize={4} mr={sizing.spacing[2]} />
              Title
            </FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              sx={isTaskTerminal ? readOnlyInputStyles : formInputBaseStyles}
            />
          </FormControl>

          <FormControl {...formControlStyles} isReadOnly={isTaskTerminal}>
            <FormLabel sx={formLabelStyles}>
              <AppIcon name="description" boxSize={4} mr={sizing.spacing[2]} />
              Description
            </FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              sx={isTaskTerminal ? readOnlyTextareaStyles : formTextareaStyles}
              rows={4}
            />
          </FormControl>

          <FormControl {...formControlStyles}>
            <FormLabel sx={formLabelStyles}>
              <AppIcon name="status" boxSize={4} mr={sizing.spacing[2]} />
              Status
            </FormLabel>
            <Select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as TaskStatus)}
              sx={formInputBaseStyles}
              isDisabled={isTaskTerminal}
              bg={isTaskTerminal ? "bgDisabled" : "bgInput"}
            >
              {Object.values(TaskStatus).map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl {...formControlStyles} isReadOnly={isTaskTerminal}>
            <FormLabel sx={formLabelStyles}>
              <AppIcon name="project" boxSize={4} mr={sizing.spacing[2]} />
              Project
            </FormLabel>
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Select project (optional)"
              sx={isTaskTerminal ? readOnlyInputStyles : formInputBaseStyles}
            >
              <option value="">-- No Project --</option>
              {projects && projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl {...formControlStyles} isReadOnly={isTaskTerminal}>
            <FormLabel sx={formLabelStyles}>
              <AppIcon name="agent" boxSize={4} mr={sizing.spacing[2]} />
              Agent
            </FormLabel>
            <Select
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Select agent (optional)"
              sx={isTaskTerminal ? readOnlyInputStyles : formInputBaseStyles}
            >
              <option value="">-- Unassigned --</option>
              {agents && agents.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </VStack>
      </ModalBody>
    </EditModalBase>
  );
};

export default EditTaskModal;
