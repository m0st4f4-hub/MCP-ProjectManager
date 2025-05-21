import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Select,
  Heading,
} from "@chakra-ui/react";
import { useTaskStore } from "@/store/taskStore";
import { TaskCreateData, TaskUpdateData, TaskStatus } from "@/types";
import AppIcon from "../common/AppIcon";

interface TaskFormProps {
  mode: "add" | "edit";
  initialData?: Partial<TaskCreateData & TaskUpdateData>;
  onSubmit: (data: TaskCreateData | TaskUpdateData) => Promise<void>;
  onClose?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  initialData = {},
  onSubmit,
  onClose,
  isLoading = false,
  submitLabel,
}) => {
  const projects = useTaskStore((state) => state.projects);
  const agents = useTaskStore((state) => state.agents);
  const fetchProjectsAndAgents = useTaskStore(
    (state) => state.fetchProjectsAndAgents,
  );
  const toast = useToast();

  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [projectId, setProjectId] = useState(initialData.project_id || "");
  const [agentId, setAgentId] = useState(initialData.agent_id || "");
  const [status, setStatus] = useState(initialData.status || TaskStatus.PENDING);

  useEffect(() => {
    fetchProjectsAndAgents();
  }, [fetchProjectsAndAgents]);

  useEffect(() => {
    setTitle(initialData.title || "");
    setDescription(initialData.description || "");
    setProjectId(initialData.project_id || "");
    setAgentId(initialData.agent_id || "");
    setStatus(initialData.status || TaskStatus.PENDING);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        title,
        description,
        project_id: projectId,
        agent_id: agentId,
        status,
      });
      toast({
        title:
          mode === "add"
            ? "Task added successfully"
            : "Task updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onClose) onClose();
      if (mode === "add") {
        setTitle("");
        setDescription("");
        setProjectId("");
        setAgentId("");
        setStatus(TaskStatus.PENDING);
      }
    } catch (error) {
      toast({
        title: mode === "add" ? "Error adding task" : "Error updating task",
        description:
          error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="bgSurface"
      p="6"
      borderRadius="lg"
      boxShadow="lg"
      borderWidth="DEFAULT"
      borderStyle="solid"
      borderColor="borderDecorative"
    >
      <VStack spacing="4">
        <Heading
          size="md"
          color="textPrimary"
          mb="2"
          textAlign="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <AppIcon name={mode === "add" ? "add" : "edit"} boxSize={5} mr={2} />
          {mode === "add" ? "Trigger New Work Item" : "Edit Task"}
        </Heading>

        <FormControl isRequired>
          <FormLabel color="textPrimary">Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            px="3"
            py="2"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="textPrimary">Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            px="3"
            py="2"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="textPrimary">Project</FormLabel>
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Select project"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel color="textPrimary">Agent</FormLabel>
          <Select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Select agent"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel color="textPrimary">Status</FormLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            placeholder="Select status"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          >
            {Object.values(TaskStatus).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          bg="bgInteractive"
          color="textInverse"
          width="full"
          size="lg"
          py="3"
          px="6"
          fontSize="lg"
          borderRadius="md"
          _hover={{ bg: "bgInteractiveHover" }}
          leftIcon={
            <AppIcon name={mode === "add" ? "add" : "save"} boxSize={5} />
          }
          isLoading={isLoading}
          isDisabled={!title.trim()}
        >
          {submitLabel || (mode === "add" ? "Add Task" : "Save Changes")}
        </Button>

        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={isLoading}
            ml="2"
          >
            Cancel
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default TaskForm;
