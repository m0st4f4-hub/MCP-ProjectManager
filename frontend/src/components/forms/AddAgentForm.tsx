"use client";

import React, { useState } from "react";
import {
  Button,
  FormControl,
  Input,
  useToast,
  Box,
  VStack,
  FormLabel,
} from "@chakra-ui/react";

interface AddAgentFormProps {
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Agent name cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(name);
      onClose();
    } catch (error) {
      toast({
        title: "Error registering agent",
        description:
          error instanceof Error ? error.message : "Could not register agent.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

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
          <FormLabel htmlFor="newAgentName">Agent Name</FormLabel>
          <Input
            id="newAgentName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter unique agent name"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          />
        </FormControl>

        <Button
          type="submit"
          bg="bgInteractive"
          color="textInverse"
          w="full"
          fontSize="lg"
          py="2"
          px="4"
          lineHeight="regular"
          borderRadius="md"
          _hover={{ bg: "bgInteractiveHover" }}
          isLoading={loading}
          size="lg"
          isDisabled={!name.trim()}
        >
          Register Agent
        </Button>

        <Button
          variant="ghost"
          onClick={onClose}
          isDisabled={loading}
          size="lg"
        >
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default AddAgentForm;
