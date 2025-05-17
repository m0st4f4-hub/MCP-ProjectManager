import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
} from "@chakra-ui/react";
import { Project, ProjectUpdateData } from "@/types";
import EditModalBase from "../common/EditModalBase";
import AppIcon from '../common/AppIcon';
import { sizing, typography, shadows } from "@/tokens";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: (updatedProjectData: ProjectUpdateData) => Promise<void>;
  onProjectDeleted: (projectId: string) => Promise<void>;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [project, isOpen]);

  const handleSave = async () => {
    if (!project) return;
    setIsLoading(true);
    const updateData: ProjectUpdateData = { name, description };
    try {
      await onProjectUpdated(updateData);
      toast({
        title: "Project updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update project:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not update the project.";
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
    if (!project) return;
    setIsDeleting(true);
    try {
      await onProjectDeleted(project.id);
      toast({
        title: "Project deleted.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      console.error("Failed to delete project:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete the project.";
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
    <EditModalBase<Project>
      isOpen={isOpen}
      onClose={onClose}
      entityName="Project"
      entityData={project}
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
        <AppIcon name="edit" boxSize={sizing.icon.md} mr={sizing.spacing[2]} color="iconPrimary" />
        Edit Project: {project?.name}
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
              <AppIcon name="project" boxSize={sizing.icon.sm} mr={sizing.spacing[2]} />
              Name
            </FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
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

          <FormControl>
            <FormLabel 
              display="flex" 
              alignItems="center"
              fontSize={typography.fontSize.sm}
              fontWeight={typography.fontWeight.medium}
              color="textSecondary"
              mb={sizing.spacing[1]}
            >
              <AppIcon name="description" boxSize={sizing.icon.sm} mr={sizing.spacing[2]} />
              Description
            </FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
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
              h="auto"
              minH={sizing.height.xl}
              py={sizing.spacing[2]}
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
          leftIcon={<AppIcon name="close" boxSize={sizing.icon.sm} />}
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
          leftIcon={<AppIcon name="save" boxSize={sizing.icon.sm} />}
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

export default EditProjectModal;
