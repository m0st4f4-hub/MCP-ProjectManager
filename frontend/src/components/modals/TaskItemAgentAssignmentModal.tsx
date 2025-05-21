import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  List,
  ListItem,
  Spinner,
  Text,
  useToast, // Import useToast here if it's to be used internally consistently
  // Or expect toast function as a prop if it's deeply integrated with TaskItem's context
} from "@chakra-ui/react";
import { Task } from "@/types"; // Assuming Task type path
import { Agent } from "@/types"; // Assuming Agent type path, or use inline {id: string, name: string}

interface TaskItemAgentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  agents: Agent[]; // Use a more specific Agent type if available from "@/types"
  editTaskInStore: (taskId: string, updates: Partial<Task>) => Promise<void>;
  // Styling props from TaskItem's useToken/useTheme
  bgSurfaceColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  borderDecorativeColor: string;
  bgInteractiveSubtleHoverColor: string;
  coreBlue100: string;
  coreBlue700: string;
  theme: any; // Consider a more specific Theme type if available
}

const TaskItemAgentAssignmentModal: React.FC<
  TaskItemAgentAssignmentModalProps
> = ({
  isOpen,
  onClose,
  task,
  agents,
  editTaskInStore,
  bgSurfaceColor,
  textPrimaryColor,
  textSecondaryColor,
  borderDecorativeColor,
  bgInteractiveSubtleHoverColor,
  coreBlue100,
  coreBlue700,
  theme,
}) => {
  const [agentLoading, setAgentLoading] = useState(false);
  const toast = useToast(); // Using its own toast instance

  const handleAgentSelect = useCallback(
    async (agent: Agent) => {
      setAgentLoading(true);
      try {
        await editTaskInStore(task.id, {
          agent_id: agent.id,
          agent_name: agent.name,
        });
        toast({
          title: `Agent assigned: ${agent.name}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Error assigning agent",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setAgentLoading(false);
        onClose(); // Close modal after selection
      }
    },
    [task.id, editTaskInStore, toast, onClose],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg={bgSurfaceColor}
        color={textPrimaryColor}
        borderWidth="borders.width.xs"
        borderColor={borderDecorativeColor}
        borderRadius="radii.md"
      >
        <ModalHeader
          borderBottomWidth="borders.width.xs"
          borderColor={borderDecorativeColor}
        >
          Assign Agent to: {task.title}
        </ModalHeader>
        <ModalCloseButton
          color={textSecondaryColor}
          _hover={{
            bg: bgInteractiveSubtleHoverColor,
            color: textPrimaryColor,
          }}
        />
        <ModalBody py="spacing.4">
          {agentLoading && <Spinner color="brandPrimary" />}
          {!agentLoading && (
            <List
              spacing={3}
              maxH="sizes.menu"
              overflowY="auto"
              mt="spacing.2"
            >
              {agents.map((agent) => (
                <ListItem
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  p="spacing.2"
                  borderRadius="radii.md"
                  fontSize={theme.fontSizes.sm}
                  cursor="pointer"
                  _hover={{ bg: bgInteractiveSubtleHoverColor }}
                  sx={
                    task.agent_id === agent.id
                      ? {
                          bg: coreBlue100,
                          color: coreBlue700,
                          fontWeight: theme.fontWeights.semibold,
                        }
                      : {}
                  }
                >
                  {agent.name}
                </ListItem>
              ))}
              {agents.length === 0 && (
                <Text color={textSecondaryColor}>No agents available.</Text>
              )}
            </List>
          )}
        </ModalBody>
        <ModalFooter
          borderTopWidth="borders.width.xs"
          borderColor={borderDecorativeColor}
        >
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskItemAgentAssignmentModal;
