"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Flex,
} from "@chakra-ui/react";
import { rulesApi } from "@/services/api";
import type { ForbiddenAction, ForbiddenActionCreateData } from "@/types";

interface AgentForbiddenActionsProps {
  roleId: string;
  initialActions?: ForbiddenAction[];
}

const AgentForbiddenActions: React.FC<AgentForbiddenActionsProps> = ({
  roleId,
  initialActions = [],
}) => {
  const [actions, setActions] = useState<ForbiddenAction[]>(initialActions);
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");

  const handleAdd = async () => {
    const data: ForbiddenActionCreateData = { action, reason };
    const newAction = await rulesApi.forbiddenActions.add(roleId, data);
    setActions((prev) => [...prev, newAction]);
    setAction("");
    setReason("");
  };

  const handleRemove = async (id: string) => {
    await rulesApi.forbiddenActions.remove(id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Box>
      <Box
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAdd();
        }}
      >
        <FormControl isRequired mb={2}>
          <FormLabel>Action</FormLabel>
          <Input value={action} onChange={(e) => setAction(e.target.value)} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Reason</FormLabel>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormControl>
        <Button type="submit" isDisabled={!action.trim()}>
          Add
        </Button>
      </Box>
      <List mt={4} spacing={2}>
        {actions.map((fa) => (
          <ListItem key={fa.id} borderWidth="1px" p={2} borderRadius="md">
            <Flex justify="space-between" align="center">
              <span>{fa.action}</span>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => handleRemove(fa.id)}
              >
                Remove
              </Button>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AgentForbiddenActions;
