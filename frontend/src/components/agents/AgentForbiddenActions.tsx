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
import { forbiddenActionsApi } from "@/services/api";
import type { AgentForbiddenAction } from "@/types";

interface AgentForbiddenActionsProps {
  agentRoleId: string;
}

const AgentForbiddenActions: React.FC<AgentForbiddenActionsProps> = ({ agentRoleId }) => {
  const toast = useToast();
  const [actions, setActions] = useState<AgentForbiddenAction[] | null>(null);
  const [newAction, setNewAction] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const loadActions = async () => {
    try {
      const data = await forbiddenActionsApi.list(agentRoleId);
      setActions(data);
    } catch (err) {
      toast({
        title: "Failed to load actions",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleCreate = async () => {
    if (!newAction.trim()) return;
    setLoading(true);
    try {
      await forbiddenActionsApi.create(agentRoleId, {
        action: newAction,
        reason: reason || undefined,
      });
      setNewAction("");
      setReason("");
      await loadActions();
      toast({ title: "Action added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to add action",
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
      await forbiddenActionsApi.delete(id);
      await loadActions();
      toast({ title: "Action removed", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to remove action",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!actions) {
    return (
      <Flex justify="center" align="center" p="4" minH="100px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={2} gap={2} flexWrap="wrap">
        <Input
          placeholder="Forbidden action"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
        />
        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button onClick={handleCreate} isLoading={loading} disabled={!newAction.trim()}>
          Add
        </Button>
      </Flex>
      {actions.length === 0 ? (
        <Text>No forbidden actions.</Text>
      ) : (
        <List spacing={2}>
          {actions.map((a) => (
            <ListItem key={a.id} borderWidth="1px" borderRadius="md" p={2}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">{a.action}</Text>
                  {a.reason && <Text fontSize="sm">{a.reason}</Text>}
                </Box>
                <Button size="sm" colorScheme="red" onClick={() => handleDelete(a.id)}>
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

export default AgentForbiddenActions;
