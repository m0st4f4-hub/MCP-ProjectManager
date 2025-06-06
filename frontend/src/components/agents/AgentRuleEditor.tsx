"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { mcpApi } from "@/services/api/mcp";

interface AgentRuleEditorProps {
  agentId: string;
  onSuccess?: () => void;
}

const AgentRuleEditor: React.FC<AgentRuleEditorProps> = ({ agentId, onSuccess }) => {
  const [ruleType, setRuleType] = useState("");
  const [ruleContent, setRuleContent] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleType.trim() || !ruleContent.trim()) {
      toast({
        title: "Rule type and content are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await mcpApi.rule.createAgentRule({
        agent_id: agentId,
        rule_type: ruleType,
        rule_content: ruleContent,
      });
      toast({
        title: "Agent rule created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setRuleType("");
      setRuleContent("");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Failed to create agent rule.",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
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
      borderWidth="DEFAULT"
      borderColor="borderDecorative"
    >
      <VStack spacing="4" align="stretch">
        <FormControl isRequired>
          <FormLabel>Rule Type</FormLabel>
          <Input
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value)}
            placeholder="Enter rule type"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Rule Content</FormLabel>
          <Textarea
            value={ruleContent}
            onChange={(e) => setRuleContent(e.target.value)}
            placeholder="Enter rule content"
          />
        </FormControl>
        <Button
          type="submit"
          bg="bgInteractive"
          color="textInverse"
          _hover={{ bg: "bgInteractiveHover" }}
          isLoading={loading}
          isDisabled={!ruleType.trim() || !ruleContent.trim()}
        >
          Create Rule
        </Button>
      </VStack>
    </Box>
  );
};

export default AgentRuleEditor;
