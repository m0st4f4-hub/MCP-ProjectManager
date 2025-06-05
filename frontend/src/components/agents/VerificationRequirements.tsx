"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { verificationRequirementsApi } from "@/services/api";
import type { VerificationRequirement } from "@/types";

interface VerificationRequirementsProps {
  agentRoleId: string;
}

const VerificationRequirements: React.FC<VerificationRequirementsProps> = ({ agentRoleId }) => {
  const toast = useToast();
  const [requirements, setRequirements] = useState<VerificationRequirement[] | null>(null);
  const [newReq, setNewReq] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRequirements = async () => {
    try {
      const data = await verificationRequirementsApi.list(agentRoleId);
      setRequirements(data);
    } catch (err) {
      toast({
        title: "Failed to load requirements",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleCreate = async () => {
    if (!newReq.trim()) return;
    setLoading(true);
    try {
      await verificationRequirementsApi.create({
        agent_role_id: agentRoleId,
        requirement: newReq,
        is_mandatory: true,
      });
      setNewReq("");
      await loadRequirements();
      toast({ title: "Requirement added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to add requirement",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await verificationRequirementsApi.delete(id);
      await loadRequirements();
      toast({ title: "Requirement removed", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to remove requirement",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!requirements) {
    return (
      <Flex justify="center" align="center" p="4" minH="100px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={2} gap={2}>
        <Input
          placeholder="New requirement"
          value={newReq}
          onChange={(e) => setNewReq(e.target.value)}
        />
        <Button onClick={handleCreate} isLoading={loading} disabled={!newReq.trim()}>
          Add
        </Button>
      </Flex>
      {requirements.length === 0 ? (
        <Text>No verification requirements.</Text>
      ) : (
        <List spacing={2}>
          {requirements.map((req) => (
            <ListItem key={req.id} borderWidth="1px" borderRadius="md" p={2}>
              <Flex justify="space-between" align="center">
                <Text>{req.requirement}</Text>
                <Button size="sm" colorScheme="red" onClick={() => handleDelete(req.id)}>
                  Delete
                </Button>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default VerificationRequirements;
