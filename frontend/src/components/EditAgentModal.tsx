import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { Agent, AgentUpdateData } from '@/services/api';
import EditModalBase from './common/EditModalBase';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onAgentUpdated: (updatedAgentData: AgentUpdateData) => Promise<void>;
  onAgentDeleted: (agentId: number) => Promise<void>;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  agent,
  onAgentUpdated,
  onAgentDeleted,
}) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (agent) {
      setName(agent.name);
    } else {
        setName('');
    }
  }, [agent, isOpen]);

  const handleSave = async () => {
    if (!agent) return;
    setIsLoading(true);
    const updateData: AgentUpdateData = { name };
    try {
      await onAgentUpdated(updateData);
      toast({
        title: 'Agent updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update agent:', error);
      const message = error instanceof Error ? error.message : 'Could not update the agent.';
      toast({
        title: 'Update failed.',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    setIsDeleting(true);
    try {
        await onAgentDeleted(agent.id);
        toast({
            title: 'Agent deleted.',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
        onClose();
    } catch (error: unknown) {
        console.error('Failed to delete agent:', error);
        const message = error instanceof Error ? error.message : 'Could not delete the agent.';
        toast({
            title: 'Deletion failed.',
            description: message,
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    } finally {
        setIsDeleting(false);
    }
 };

  return (
    <EditModalBase<Agent>
        isOpen={isOpen}
        onClose={onClose}
        entityName="Agent"
        entityData={agent}
        entityDisplayField="name"
        onSave={handleSave}
        onDelete={handleDelete}
        isLoadingSave={isLoading}
        isLoadingDelete={isDeleting}
        size="lg"
    >
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agent Name"
          />
        </FormControl>
    </EditModalBase>
  );
};

export default EditAgentModal; 