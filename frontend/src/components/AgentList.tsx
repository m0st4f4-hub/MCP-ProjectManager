'use client';

import React, { useState } from 'react';
import { Box, Text, List, ListItem, ListIcon, Heading, IconButton, useDisclosure, Spinner } from '@chakra-ui/react';
import { MdPerson, MdEdit } from 'react-icons/md'; // Assuming MdPerson for agent icon
import { Agent } from '@/services/api';
import EditAgentModal from './EditAgentModal'; // Import the modal
import { useTaskStore } from '@/store/taskStore'; // Import the store

const AgentList: React.FC = () => {
  // Get data and actions from the store
  const agents = useTaskStore((state) => state.agents);
  const loadingAgents = useTaskStore((state) => state.loadingAgents);
  const updateAgentAction = useTaskStore((state) => state.updateAgentAction);
  const deleteAgentAction = useTaskStore((state) => state.deleteAgentAction);

  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal state management
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedAgent(null);
    onClose();
  };

  const handleAgentUpdated = async (updatedAgent: Agent) => {
    try {
        await updateAgentAction(updatedAgent.id, { name: updatedAgent.name });
    } catch (_error) {
        console.error("Update failed in AgentList, handled by store/modal.");
    }
  };

  const handleAgentDeleted = async (agentId: number) => {
     try {
        await deleteAgentAction(agentId);
    } catch (_error) {
        console.error("Delete failed in AgentList, handled by store/modal.");
    }
  };

  if (loadingAgents) {
    return <Spinner />;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" borderColor="border.default" bg="bg.surface">
      <Heading size="md" mb={4} color="text.default">Agents</Heading>
      {agents.length === 0 && !loadingAgents ? (
        <Text color="text.secondary">No agents found.</Text>
      ) : (
        <List spacing={3}>
          {agents.map((agent) => (
            <ListItem key={agent.id} display="flex" justifyContent="space-between" alignItems="center" py={2} borderBottomWidth="1px" borderColor="border.default">
              <Box>
                <ListIcon as={MdPerson} color="blue.500" />
                <Text as="span" fontWeight="bold" color="text.default">{agent.name}</Text>
              </Box>
              <IconButton
                aria-label="Edit agent"
                icon={<MdEdit />}
                size="sm"
                variant="ghost"
                onClick={() => handleEditClick(agent)}
                color="text.secondary"
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Render the modal */}
      <EditAgentModal
        isOpen={isOpen}
        onClose={handleModalClose}
        agent={selectedAgent}
        onAgentUpdated={handleAgentUpdated}
        onAgentDeleted={handleAgentDeleted}
      />
    </Box>
  );
};

export default AgentList; 