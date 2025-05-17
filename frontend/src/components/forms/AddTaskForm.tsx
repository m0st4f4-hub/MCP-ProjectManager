// D:\\mcp\\task-manager\\frontend\\src\\components\\AddTaskForm.tsx
"use client";

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
import { TaskCreateData, TaskStatus } from "@/types";
import AppIcon from '../common/AppIcon';

// Task ID: <taskId_placeholder>
// Agent Role: PresentationLayerSpecialist
// Request ID: <requestId_placeholder>
// Timestamp: <timestamp_placeholder>

const AddTaskForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const addTask = useTaskStore((state) => state.addTask);
  const projects = useTaskStore((state) => state.projects);
  const agents = useTaskStore((state) => state.agents);
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchProjectsAndAgents = useTaskStore(
    (state) => state.fetchProjectsAndAgents,
  );
  const toast = useToast();

  const [formData, setFormData] = useState<TaskCreateData>({
    title: "",
    description: null,
    project_id: null,
    agent_id: null,
    status: TaskStatus.PENDING,
  });

  useEffect(() => {
    fetchProjectsAndAgents();
    fetchTasks().then(() => {
      if (process.env.NODE_ENV === "development") {
        console.log(`AddTaskForm: Fetched ${tasks.length} tasks.`);
      }
    });
  }, [fetchProjectsAndAgents, fetchTasks, tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask(formData);
      setFormData({
        title: "",
        description: null,
        project_id: null,
        agent_id: null,
        status: TaskStatus.PENDING,
      });
      toast({
        title: "Task added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error adding task",
        description:
          error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChange = (
    field: keyof TaskCreateData,
    value: string | number | null | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <Heading size="md" color="textPrimary" mb="2" textAlign="center" display="flex" alignItems="center" justifyContent="center">
          <AppIcon name="add" boxSize={5} mr={2} />
          Trigger New Work Item
        </Heading>

        <FormControl isRequired>
          <FormLabel color="textPrimary">Title</FormLabel>
          <Input
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
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
            value={formData.description || ""}
            onChange={(e) =>
              handleChange("description", e.target.value || null)
            }
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
            value={formData.project_id || ""}
            onChange={(e) => handleChange("project_id", e.target.value || null)}
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
            value={formData.agent_id || ""}
            onChange={(e) => handleChange("agent_id", e.target.value || null)}
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
          leftIcon={<AppIcon name="add" boxSize={5} />}
        >
          Trigger New Work Item
        </Button>
      </VStack>
    </Box>
  );
};

export default AddTaskForm;
