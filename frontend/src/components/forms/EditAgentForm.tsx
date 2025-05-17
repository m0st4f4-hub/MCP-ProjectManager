"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Input,
  useToast,
  Box,
  VStack,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/react";
import { Agent } from "@/types"; // Assuming Agent type is available

interface EditAgentFormProps {
  agent: Agent;
  // isOpen: boolean; // This prop is not used by AgentList.tsx when calling EditAgentForm, consider removing if not needed elsewhere
  onClose: () => void;
  onSubmit: (agentId: string, newName: string) => Promise<void>; // Re-added onSubmit
}

const EditAgentForm: React.FC<EditAgentFormProps> = ({
  agent,
  onClose,
  onSubmit,
}) => {
  // Added onSubmit to destructuring
  const [name, setName] = useState(""); // Initialize with empty string, useEffect will set it
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (agent) {
      setName(agent.name);
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) {
      toast({
        title: "No agent selected for editing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!name.trim()) {
      toast({
        title: "Agent name cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit(agent.id, name.trim()); // This should now align with the prop
      // Parent component (AgentList modal) will handle closing and success toast
      // Call onClose after successful submission
      onClose();
    } catch (error) {
      toast({
        title: "Error updating agent",
        description:
          error instanceof Error ? error.message : "Could not update agent.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!agent) {
    // Optionally, render a loading state or null if no agent is passed yet
    // This case should ideally be handled by the parent controlling the modal visibility
    return null;
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="bgSurface"
      p="6"
      borderRadius="lg"
      shadow="lg"
      borderWidth="DEFAULT"
      borderStyle="solid"
      borderColor="borderDecorative"
    >
      <VStack spacing="4" align="stretch">
        <FormControl isRequired>
          <FormLabel htmlFor="agentName">Agent Name</FormLabel>
          <Input
            id="agentName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter unique agent name"
          />
        </FormControl>

        <FormHelperText mt="1">
          Provide a unique and descriptive name for the agent. For example,
          &quot;Research Assistant&quot; or &quot;Content Summarizer&quot;.
        </FormHelperText>

        <Button
          type="submit"
          bg="accent"
          color="textInverse"
          w="full"
          fontSize="lg"
          py="2"
          px="4"
          lineHeight="regular"
          borderRadius="md"
          _hover={{ bg: "orange.600" }}
          isLoading={isLoading}
          size="lg"
        >
          Update Agent
        </Button>
      </VStack>
    </Box>
  );
};

export default EditAgentForm;
