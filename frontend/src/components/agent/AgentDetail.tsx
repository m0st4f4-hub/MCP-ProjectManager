'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Select,
  Button,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { getAgentById } from '@/services/api/agents';
import { rulesApi } from '@/services/api/rules';
import type { Agent } from '@/types/agent';
import type { AgentPromptTemplate } from '@/types/agent_prompt_template';

const AgentDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const toast = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [templates, setTemplates] = useState<AgentPromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    if (!agentId) return;
    const fetchData = async () => {
      try {
        const [agentData, tmplData] = await Promise.all([
          getAgentById(agentId),
          rulesApi.templates.list(),
        ]);
        setAgent(agentData);
        setTemplates(tmplData);
      } catch (err) {
        toast({
          title: 'Failed to load agent',
          description: err instanceof Error ? err.message : String(err),
          status: 'error',
          duration: 5000,
        });
      }
    };
    fetchData();
  }, [agentId, toast]);

  const handleApply = async () => {
    if (!agentId || !selectedTemplate) return;
    try {
      await rulesApi.templates.apply(agentId, selectedTemplate);
      toast({ title: 'Template applied', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Failed to apply template',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (!agent) return <div>Loading...</div>;

  return (
    <Box p="4">
      <Heading size="md" mb="4">
        Agent: {agent.name}
      </Heading>
      <VStack align="start" spacing="4">
        <Select
          placeholder="Select template"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.template_name}
            </option>
          ))}
        </Select>
        <Button
          colorScheme="blue"
          onClick={handleApply}
          isDisabled={!selectedTemplate}
        >
          Apply Template
        </Button>
      </VStack>
    </Box>
  );
};

export default AgentDetail;
