<<<<<<< HEAD
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
  const [newReason, setNewReason] = useState("");
  const [loading, setLoading] = useState(false);

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

  if (!actions) {
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
          placeholder="Forbidden action"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
        />
        <Input
          placeholder="Reason (optional)"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
        />
        <Button onClick={handleCreate} isLoading={loading} disabled={!newAction.trim()}>
          Add
        </Button>
      </Flex>
      {actions.length === 0 ? (
        <Text>No forbidden actions.</Text>
      ) : (
        <List spacing={2}>
          {actions.map((action) => (
            <ListItem key={action.id} borderWidth="1px" borderRadius="md" p={2}>
              <Flex justify="space-between" align="center">
                <Text>{action.action}</Text>
                <Button size="sm" colorScheme="red" onClick={() => handleDelete(action.id)}>
                  Delete
                </Button>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
=======
'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const AgentForbiddenActions: React.FC = () => {
  const [action, setAction] = useState('');
  const [actions, setActions] = useState<string[]>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = action.trim();
    if (!trimmed) return;
    setActions((prev) => [...prev, trimmed]);
    setAction('');
  };

  const handleRemove = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box p={4}>
      <Box as="form" onSubmit={handleAdd} mb={4}>
        <FormControl>
          <FormLabel htmlFor="forbidden-action">Forbidden Action</FormLabel>
          <Input
            id="forbidden-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Enter action"
          />
        </FormControl>
        <Button mt={2} type="submit" colorScheme="blue">
          Add Action
        </Button>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Action</Th>
            <Th>Remove</Th>
          </Tr>
        </Thead>
        <Tbody>
          {actions.map((act, idx) => (
            <Tr key={idx} data-testid="forbidden-action-row">
              <Td>{act}</Td>
              <Td>
                <IconButton
                  aria-label="Remove"
                  icon={<DeleteIcon />}
                  size="sm"
                  onClick={() => handleRemove(idx)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
>>>>>>> origin/6iktiw-codex/build-agentforbiddenactions-component
    </Box>
  );
};

export default AgentForbiddenActions;
