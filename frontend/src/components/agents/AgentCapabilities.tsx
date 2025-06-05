"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  List,
  ListItem,
  Text,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { capabilityApi, Capability } from "@/services/api/capabilities";

interface AgentCapabilitiesProps {
  roleId: string;
}

const AgentCapabilities: React.FC<AgentCapabilitiesProps> = ({ roleId }) => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [capName, setCapName] = useState("");
  const [capDescription, setCapDescription] = useState("");
  const toast = useToast();

  const loadCapabilities = async () => {
    try {
      const data = await capabilityApi.list(roleId);
      setCapabilities(data);
    } catch (err) {
      toast({
        title: "Failed to load capabilities",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadCapabilities();
  }, [roleId]);

  const handleAdd = async () => {
    if (!capName.trim()) return;
    try {
      const newCap = await capabilityApi.add(roleId, capName.trim(), capDescription.trim() || undefined);
      setCapabilities((prev) => [...prev, newCap]);
      setCapName("");
      setCapDescription("");
    } catch (err) {
      toast({
        title: "Failed to add capability",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (capabilityId: string) => {
    try {
      await capabilityApi.remove(capabilityId);
      setCapabilities((prev) => prev.filter((cap) => cap.id !== capabilityId));
    } catch (err) {
      toast({
        title: "Failed to remove capability",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      <Flex mb={4} gap={2} align="center">
        <Input
          placeholder="Capability"
          value={capName}
          onChange={(e) => setCapName(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={capDescription}
          onChange={(e) => setCapDescription(e.target.value)}
        />
        <Button leftIcon={<AddIcon />} onClick={handleAdd} size="sm">
          Add
        </Button>
      </Flex>
      <List spacing={3}>
        {capabilities.map((cap) => (
          <ListItem key={cap.id} borderWidth="1px" borderRadius="md" p={2}>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">{cap.capability}</Text>
                {cap.description && (
                  <Text fontSize="sm" color="gray.500">
                    {cap.description}
                  </Text>
                )}
              </Box>
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => handleDelete(cap.id)}
              >
                Delete
              </Button>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AgentCapabilities;
