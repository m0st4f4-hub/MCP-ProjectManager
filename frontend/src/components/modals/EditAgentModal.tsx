import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  useToast,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
} from "@chakra-ui/react";
import { Agent, AgentUpdateData } from "@/types";
import EditModalBase from "../common/EditModalBase";
import AppIcon from "../common/AppIcon";
import { sizing, typography, shadows } from "@/tokens";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onAgentUpdated: (updatedAgentData: AgentUpdateData) => Promise<void>;
  onAgentDeleted: (agentId: string) => Promise<void>;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  agent,
  onAgentUpdated,
  onAgentDeleted,
}) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (agent) {
      setName(agent.name);
    } else {
      setName("");
    }
  }, [agent, isOpen]);

  const handleSave = async () => {
    if (!agent) return;
    setIsLoading(true);
    const updateData: AgentUpdateData = { name };
    try {
      await onAgentUpdated(updateData);
      toast({
        title: "Agent updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update agent:", error);
      const message =
        error instanceof Error ? error.message : "Could not update the agent.";
      toast({
        title: "Update failed.",
        description: message,
        status: "error",
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
        title: "Agent deleted.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error("Failed to delete agent:", error);
      const message =
        error instanceof Error ? error.message : "Could not delete the agent.";
      toast({
        title: "Deletion failed.",
        description: message,
        status: "error",
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
      <ModalHeader
        borderBottomWidth={sizing.borderWidth.DEFAULT}
        borderColor="borderDecorative"
        display="flex"
        alignItems="center"
        fontSize={typography.fontSize.lg}
        fontWeight={typography.fontWeight.semibold}
        color="textPrimary"
        py={sizing.spacing[3]}
      >
        <AppIcon
          name="edit"
          boxSize={"24px"}
          mr={sizing.spacing[2]}
          color="iconPrimary"
        />
        Edit Agent: {agent?.name}
      </ModalHeader>
      <ModalBody py={sizing.spacing[5]}>
        <VStack spacing={sizing.spacing[4]} align="stretch">
          <FormControl>
            <FormLabel
              display="flex"
              alignItems="center"
              fontSize={typography.fontSize.sm}
              fontWeight={typography.fontWeight.medium}
              color="textSecondary"
              mb={sizing.spacing[1]}
            >
              <AppIcon name="agent" boxSize={"20px"} mr={sizing.spacing[2]} />
              Name
            </FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
              bg="bgInput"
              color="textInput"
              borderColor="borderInteractive"
              borderRadius={sizing.borderRadius.md}
              fontSize={typography.fontSize.sm}
              _placeholder={{ color: "textPlaceholder" }}
              _hover={{ borderColor: "borderHover" }}
              _focus={{
                borderColor: "borderFocused",
                boxShadow: shadows.outline,
              }}
              h={sizing.height.md}
            />
          </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter
        borderTopWidth={sizing.borderWidth.DEFAULT}
        borderColor="borderDecorative"
        py={sizing.spacing[3]}
      >
        <Button
          variant="ghost"
          mr={sizing.spacing[3]}
          onClick={onClose}
          isDisabled={isLoading || isDeleting}
          leftIcon={<AppIcon name="close" boxSize={"20px"} />}
          color="textSecondary"
          _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
          _active={{ bg: "interactiveNeutralActive" }}
          h={sizing.height.md}
          fontSize={typography.fontSize.sm}
        >
          Cancel
        </Button>
        <Button
          bg="interactivePrimary"
          color="onInteractivePrimary"
          _hover={{ bg: "interactivePrimaryHover" }}
          _active={{ bg: "interactivePrimaryActive" }}
          onClick={handleSave}
          isLoading={isLoading}
          isDisabled={isDeleting}
          leftIcon={<AppIcon name="save" boxSize={"20px"} />}
          h={sizing.height.md}
          fontSize={typography.fontSize.sm}
          fontWeight={typography.fontWeight.medium}
        >
          Save Changes
        </Button>
      </ModalFooter>
    </EditModalBase>
  );
};

export default EditAgentModal;
