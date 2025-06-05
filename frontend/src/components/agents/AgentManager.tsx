"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useAgentStore } from "@/store/agentStore";
import { createAgent, updateAgentById, deleteAgentById } from "@/services/api/agents";
import AddAgentModal from "@/components/agent/AddAgentModal";
import EditAgentModal from "@/components/agent/EditAgentModal";
import { Agent } from "@/types";

const AgentManager: React.FC = () => {
  const agents = useAgentStore((state) => state.agents);
  const fetchAgents = useAgentStore((state) => state.fetchAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const toast = useToast();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  useEffect(() => {
    fetchAgents(0, 100);
  }, [fetchAgents]);

  const handleAddAgent = async (name: string) => {
    try {
      await createAgent({ name });
      await fetchAgents(0, 100);
      toast({ title: "Agent created", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Error creating agent",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditAgent = async (id: string, name: string) => {
    try {
      await updateAgentById(id, { name });
      await fetchAgents(0, 100);
      toast({ title: "Agent updated", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Error updating agent",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgentById(id);
      await fetchAgents(0, 100);
      toast({ title: "Agent deleted", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Error deleting agent",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!agents) {
    return (
      <Flex justify="center" align="center" p="10" minH="300px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box p={4} maxW="600px" mx="auto">
      <Flex justify="space-between" mb={4} align="center">
        <Text fontSize="xl" fontWeight="bold">
          Agents
        </Text>
        <Button leftIcon={<AddIcon />} onClick={onAddOpen} size="sm">
          Add Agent
        </Button>
      </Flex>
      {agents.length === 0 ? (
        <Text>No agents found.</Text>
      ) : (
        <List spacing={3}>
          {agents.map((agent) => (
            <ListItem key={agent.id} borderWidth="1px" borderRadius="md" p={2}>
              <Flex justify="space-between" align="center">
                <Text>{agent.name}</Text>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedAgent(agent);
                      onEditOpen();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    leftIcon={<DeleteIcon />}
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
      <AddAgentModal isOpen={isAddOpen} onClose={onAddClose} onSubmit={handleAddAgent} />
      <EditAgentModal
        isOpen={isEditOpen}
        onClose={() => {
          setSelectedAgent(null);
          onEditClose();
        }}
        onSubmit={handleEditAgent}
        agent={selectedAgent}
      />
    </Box>
  );
};

export default AgentManager;
