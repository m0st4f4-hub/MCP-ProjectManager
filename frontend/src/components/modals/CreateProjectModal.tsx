import * as logger from '@/utils/logger';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { createProject } from "@/services/api/projects";
import { ProjectCreateData } from "@/types/project";
import { sizing, typography } from "@/tokens"; // Added sizing and typography

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void; // Callback to refresh project list
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const projectData: ProjectCreateData = {
        name: projectName,
        description: projectDescription,
      };
      await createProject(projectData);
      toast({
        title: "Project created.",
        description: "We've created your project for you.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onProjectCreated(); // Refresh the project list
      onClose(); // Close the modal
      setProjectName(""); // Reset form
      setProjectDescription("");
    } catch (error) {
      logger.error("Failed to create project:", error);
      toast({
        title: "Failed to create project.",
        description:
          (error as Error).message || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formLabelStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "textSecondary",
    mb: sizing.spacing[1],
  };

  const inputStyles = {
    bg: "bgInput",
    color: "textInput",
    borderColor: "borderInteractive",
    borderRadius: sizing.borderRadius.md,
    fontSize: typography.fontSize.sm,
    _placeholder: { color: "textPlaceholder" },
    _hover: { borderColor: "borderHover" },
    _focus: {
      borderColor: "borderFocused",
      boxShadow: `0 0 0 1px ${typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--chakra-colors-blue-500").trim() : "blue.500"}`, // Placeholder focus
    },
    h: sizing.height.md,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(2px)" bg="overlayDefault" />
      <ModalContent
        bg="bgModal"
        color="onSurface"
        borderColor="borderDecorative"
        borderWidth={sizing.borderWidth.DEFAULT}
        borderRadius={sizing.borderRadius.lg} // Match other modals
        overflow="hidden"
      >
        <ModalHeader
          borderBottomWidth={sizing.borderWidth.DEFAULT}
          borderColor="borderDecorative"
          fontSize={typography.fontSize.lg}
          fontWeight={typography.fontWeight.semibold}
          py={sizing.spacing[3]} // Adjust padding
        >
          Create New Project
        </ModalHeader>
        <ModalCloseButton
          color="iconPrimary"
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }}
          _active={{ bg: "interactiveNeutralActive" }}
          top="10px"
          right="10px"
        />
        <ModalBody py={sizing.spacing[5]}>
          <VStack spacing={sizing.spacing[4]}>
            <FormControl isRequired>
              <FormLabel sx={formLabelStyles}>Project Name</FormLabel>
              <Input
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                sx={inputStyles}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={formLabelStyles}>
                Project Description (Optional)
              </FormLabel>
              <Textarea
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                sx={{
                  ...inputStyles,
                  h: "auto",
                  minH: sizing.spacing[24],
                  pt: sizing.spacing[2],
                  pb: sizing.spacing[2],
                }}
                rows={3}
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
            isDisabled={isLoading}
            color="textSecondary"
            _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
            _active={{ bg: "interactiveNeutralActive" }}
            h={sizing.height.md}
            fontSize={typography.fontSize.sm}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            isLoading={isLoading}
            bg="interactivePrimary"
            color="onInteractivePrimary"
            _hover={{ bg: "interactivePrimaryHover" }}
            _active={{ bg: "interactivePrimaryActive" }}
            h={sizing.height.md}
            fontSize={typography.fontSize.sm}
            fontWeight={typography.fontWeight.medium}
          >
            Create Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;
