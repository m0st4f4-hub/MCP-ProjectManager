"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { createTask } from "@/services/api";
import type { Task, TaskCreateData } from "@/types";
import { TaskStatus } from "@/types";

const TaskRunner: React.FC = () => {
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const taskData: TaskCreateData = {
        project_id: projectId,
        title,
        description,
        status: TaskStatus.TO_DO,
      };
      const newTask = await createTask(projectId, taskData);
      setTask(newTask);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="md" mb="4">
        Task Runner
      </Heading>
      <FormControl mb="2">
        <FormLabel>Project ID</FormLabel>
        <Input
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </FormControl>
      <FormControl mb="2">
        <FormLabel>Title</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>
      <FormControl mb="2">
        <FormLabel>Description</FormLabel>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>
      <Button onClick={handleRun} isDisabled={!projectId || !title}>
        Run Task
      </Button>
      {loading && <Spinner ml="2" />}
      {error && (
        <Text color="textError" mt="2">
          {error}
        </Text>
      )}
      {task && (
        <Box mt="4" borderWidth="1px" p="2" borderRadius="md">
          <Text fontWeight="bold">Created Task #{task.task_number}</Text>
          <Text fontSize="sm">{task.title}</Text>
        </Box>
      )}
    </Box>
  );
};

export default TaskRunner;
