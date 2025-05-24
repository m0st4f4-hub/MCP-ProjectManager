import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  List,
  ListItem,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { Agent, Task } from "@/types";
import { sizing } from "@/tokens";

interface AgentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  loading?: boolean;
  onSelect: (agent: Agent) => void;
  selectedTask?: Task;
}

const AgentAssignmentModal: React.FC<AgentAssignmentModalProps> = ({
  isOpen,
  onClose,
  agents,
  loading = false,
  onSelect,
  selectedTask,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
    <ModalOverlay />
    <ModalContent bg="bg.modal">
      <ModalHeader borderBottomWidth="1px" borderColor="border.base">
        Assign Agent{selectedTask ? ` to ${selectedTask.title}` : ""}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={sizing.spacing[5]}>
            <Spinner color="primary" />
          </Box>
        ) : (
          <List spacing={2}>
            {agents.length === 0 && <ListItem>No agents available.</ListItem>}
            {agents.map((agent) => (
              <ListItem
                key={agent.id}
                onClick={() => onSelect(agent)}
                cursor="pointer"
                _hover={{ bg: "bg.subtle" }}
                p={2}
                rounded="md"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <span>{agent.name}</span>
                <span style={{ fontSize: '0.85em', color: '#888' }}>{agent.status || 'offline'}</span>
              </ListItem>
            ))}
          </List>
        )}
      </ModalBody>
      <ModalFooter borderTopWidth="1px" borderColor="border.base">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default AgentAssignmentModal; 