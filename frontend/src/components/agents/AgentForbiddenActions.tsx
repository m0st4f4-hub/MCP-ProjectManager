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
  VStack,
  HStack,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { forbiddenActionsApi } from "@/services/api";
import type { AgentForbiddenAction } from "@/types/agents";

interface AgentForbiddenActionsProps {
  agentRoleId: string;
}

const AgentForbiddenActions: React.FC<AgentForbiddenActionsProps> = ({ agentRoleId }) => {
  const toast = useToast();
  const [actions, setActions] = useState<AgentForbiddenAction[] | null>(null);
  const [newAction, setNewAction] = useState("");
  const [newReason, setNewReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAction, setEditAction] = useState("");
  const [editReason, setEditReason] = useState("");

  const loadActions = async () => {
    try {
      const data = await forbiddenActionsApi.list(agentRoleId);
      setActions(data);
    } catch (err) {
      toast({
        title: "Failed to load forbidden actions",
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
        reason: newReason || null,
      });
      setNewAction("");
      setNewReason("");
      await loadActions();
      toast({ title: "Forbidden action added", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to add forbidden action",
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
      toast({ title: "Forbidden action removed", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Failed to remove forbidden action",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (action: AgentForbiddenAction) => {
    setEditingId(action.id);
    setEditAction(action.action);
    setEditReason(action.reason || '');
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    try {
      await forbiddenActionsApi.update(id, {
        action: editAction,
        reason: editReason || null,
      });
      setEditingId(null);
      await loadActions();
      toast({
        title: "Forbidden action updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to update forbidden action",
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
      <VStack spacing={4} align="stretch">
        {/* Add new forbidden action form */}
        <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            Add New Forbidden Action
          </Text>
          <VStack spacing={2}>
            <Input
              placeholder="Action name"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
            />
            <Textarea
              placeholder="Reason (optional)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
            <Button
              onClick={handleCreate}
              isLoading={loading}
              isDisabled={!newAction.trim()}
              colorScheme="red"
              w="full"
            >
              Add Forbidden Action
            </Button>
          </VStack>
        </Box>

        {/* Forbidden actions list */}
        <List spacing={2}>
          {actions.map((action) => (
            <ListItem
              key={action.id}
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              {editingId === action.id ? (
                <VStack spacing={2} align="stretch">
                  <Input
                    value={editAction}
                    onChange={(e) => setEditAction(e.target.value)}
                  />
                  <Textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                  />
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<CheckIcon />}
                      onClick={() => handleUpdate(action.id)}
                      isLoading={loading}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<CloseIcon />}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Flex justify="space-between" align="center">
                  <Box flex={1}>
                    <Text fontWeight="semibold">{action.action}</Text>
                    {action.reason && (
                      <Text fontSize="sm" color="gray.600">
                        Reason: {action.reason}
                      </Text>
                    )}
                  </Box>
                  <HStack>
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      aria-label="Edit forbidden action"
                      onClick={() => startEdit(action)}
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      aria-label="Delete forbidden action"
                      colorScheme="red"
                      onClick={() => handleDelete(action.id)}
                      isLoading={loading}
                    />
                  </HStack>
                </Flex>
              )}
            </ListItem>
          ))}
        </List>

        {actions.length === 0 && (
          <Text textAlign="center" color="gray.500" py={4}>
            No forbidden actions defined yet
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default AgentForbiddenActions;
