"use client";

import React, { useEffect, useState } from "react";
import {
  VStack,
  Box,
  Text,
  useToast,
  useDisclosure,
  StackDivider,
  CopyIcon as ChakraCopyIcon,
} from "@chakra-ui/react";
import { useAgentStore } from "@/store/agentStore";
import { useTaskStore } from "@/store/taskStore";
import { Agent, TaskStatus } from "@/types";
import { useProjectStore } from "../store/projectStore";
import { AgentState } from "@/store/agentStore";
import AgentListHeader from "./agent/AgentListHeader";
import AddAgentModal from "./agent/AddAgentModal";
import EditAgentModal from "./agent/EditAgentModal";
import CliPromptModal from "./agent/CliPromptModal";
import AgentCard /* AgentStats */ from "./agent/AgentCard";

const AgentList: React.FC = () => {
  const agents = useAgentStore((state: AgentState) => state.agents);
  const agentsLoading = useAgentStore((state: AgentState) => state.loading);
  const agentsError = useAgentStore((state: AgentState) => state.error);
  const fetchAgents = useAgentStore((state: AgentState) => state.fetchAgents);
  const removeAgent = useAgentStore((state: AgentState) => state.removeAgent);
  const addAgent = useAgentStore((state: AgentState) => state.addAgent);
  const editAgent = useAgentStore((state: AgentState) => state.editAgent);
  const agentFilters = useAgentStore((state: AgentState) => state.filters);
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const toast = useToast();
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  const {
    isOpen: isAddAgentModalOpen,
    onOpen: onAddAgentModalOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [cliPromptModalOpen, setCliPromptModalOpen] = useState(false);
  const [currentCliPrompt, setCurrentCliPrompt] = useState({
    text: "",
    agentName: "",
  });

  useEffect(() => {
    fetchAgents();
    fetchProjects();
    fetchTasks();
  }, [fetchAgents, fetchProjects, fetchTasks]);

  const getAgentStats = (agentId: string) => {
    const agentTasks = tasks.filter((task) => task.agent_id === agentId);
    const taskCount = agentTasks.length;
    const projectIds = Array.from(
      new Set(agentTasks.map((task) => task.project_id).filter(Boolean)),
    );
    const projectCount = projectIds.length;
    const projectNames = projectIds
      .map((pid) => projects.find((p) => p.id === pid)?.name)
      .filter((name): name is string => !!name);
    const isActive = agentTasks.some(
      (task) => task.status !== TaskStatus.COMPLETED,
    );
    const status = isActive ? "Active" : "Idle";
    const statusColorScheme = status === "Active" ? "green" : "gray";
    return {
      taskCount,
      projectCount,
      projectNames,
      status,
      statusColorScheme,
    };
  };

  const handleAddAgentSubmit = async (name: string) => {
    try {
      await addAgent({ name });
      toast({
        title: "Agent registered.",
        description: `Agent '${name}' has been added.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onAddClose();
    } catch (error) {
      console.error("[AgentList] Failed to add agent:", error);
      toast({
        title: "Error Adding Agent",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditAgentSubmit = async (agentId: string, newName: string) => {
    try {
      await editAgent(agentId, { name: newName });
      toast({
        title: "Agent updated.",
        description: `Agent updated to name '${newName}'.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
    } catch (error) {
      console.error("[AgentList] Failed to edit agent:", error);
      toast({
        title: "Error Editing Agent",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAgentDelete = async (id: string, name: string) => {
    try {
      await removeAgent(id);
      toast({
        title: "Agent Deleted",
        description: `Agent ${name} (${id}) has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error Deleting Agent",
        description:
          error instanceof Error
            ? error.message
            : `Could not delete agent ${name}.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleOpenEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    onEditOpen();
  };

  const handleCopyAgentId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Agent ID Copied",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleOpenCliPrompt = (agent: Agent) => {
    const agentTasks = tasks.filter((task) => task.agent_id === agent.id);
    let prompt = `@${agent.name}, you are assigned the following tasks. Please execute each task, update its status as you progress, and mark it as finished when done.\nAgent ID: ${agent.id}\n`;
    if (agentTasks.length === 0) {
      prompt += "\nNo tasks are currently assigned to you.";
    } else {
      prompt += "\nTasks:";
      agentTasks.forEach((task, idx) => {
        prompt += `\n${idx + 1}. Task ID: ${task.id}`;
        prompt += `\n   - Task Name: ${task.title}`;
        if (task.description)
          prompt += `\n   - Description: ${task.description}`;
        prompt += "\n";
      });
    }
    setCurrentCliPrompt({ text: prompt, agentName: agent.name });
    setCliPromptModalOpen(true);
  };

  const handleCopyAgentGetCommand = async (agentId: string) => {
    const command = `mcp agent get --id ${agentId}`;
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "Agent 'get' command copied!",
        description: command,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy command",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredAgents = React.useMemo(() => {
    if (!agents) return [];
    return agents.filter((agent: Agent) => {
      if (!agent) return false;
      if (agentFilters.search) {
        const searchTermLower = agentFilters.search.toLowerCase();
        if (!agent.name?.toLowerCase().includes(searchTermLower)) return false;
      }
      if (agentFilters.status && agentFilters.status !== "all") {
        const agentTasks = tasks.filter(
          (task) =>
            task.agent_name === agent.name || task.agent_id === agent.id,
        );
        const isActive = agentTasks.some(
          (task) => task.status !== TaskStatus.COMPLETED,
        );
        const currentStatus = isActive
          ? "busy"
          : agentTasks.length > 0
            ? "available"
            : "offline";
        if (
          agentFilters.status === "available" &&
          currentStatus !== "available" &&
          currentStatus !== "offline"
        )
          return false;
        if (agentFilters.status === "busy" && currentStatus !== "busy")
          return false;
        if (agentFilters.status === "offline" && currentStatus !== "offline")
          return false;
      }
      return true;
    });
  }, [agents, agentFilters, tasks]);

  if (agentsLoading)
    return <Text color="textPlaceholder">Loading agents...</Text>;
  if (agentsError)
    return (
      <Text color="colors.textCritical">
        Error loading agents: {agentsError}
      </Text>
    );

  return (
    <VStack
      alignItems="stretch"
      divider={<StackDivider borderColor="borderDecorative" />}
    >
      <AgentListHeader
        agents={agents}
        tasks={tasks}
        onAddAgentClick={onAddAgentModalOpen}
      />

      {filteredAgents.length === 0 && (
        <Box textAlign="center" py="spacing.10">
          <Text color="textPlaceholder">
            No agents found matching your criteria.
          </Text>
        </Box>
      )}

      <VStack spacing={0} align="stretch">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            stats={getAgentStats(agent.id)}
            onEdit={() => handleOpenEditModal(agent)}
            onDelete={() => handleAgentDelete(agent.id, agent.name)}
            onCopyId={() => handleCopyAgentId(agent.id)}
            onOpenCliPrompt={() => handleOpenCliPrompt(agent)}
            onCopyGetCommand={handleCopyAgentGetCommand}
          />
        ))}
      </VStack>

      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onClose={onAddClose}
        onSubmit={handleAddAgentSubmit}
      />

      <EditAgentModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onSubmit={handleEditAgentSubmit}
        agent={selectedAgent}
      />

      <CliPromptModal
        isOpen={cliPromptModalOpen}
        onClose={() => setCliPromptModalOpen(false)}
        cliPromptText={currentCliPrompt.text}
        agentName={currentCliPrompt.agentName}
      />
    </VStack>
  );
};

export default AgentList;
