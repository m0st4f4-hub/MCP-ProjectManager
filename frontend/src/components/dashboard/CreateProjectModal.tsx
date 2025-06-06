"use client";
import * as logger from '@/utils/logger';

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  VStack,
} from "@chakra-ui/react";
import { ProjectCreateData } from "@/types";
import { createProject } from "@/services/api";
import { useProjectStore } from "@/store/projectStore";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSubmit will be handled internally by calling createProject and then fetchProjects
}

interface ProjectFormData {
  name: string;
  description?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>();
  const toast = useToast();
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  const onSubmitHandler: SubmitHandler<ProjectFormData> = async (data) => {
    const projectData: ProjectCreateData = {
      name: data.name,
      description: data.description || undefined,
    };
    try {
      await createProject(projectData);
      toast({
        title: "Project created",
        description: `Project "${data.name}" has been successfully created.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchProjects(); // Refresh the project list
      reset();
      onClose();
    } catch (error) {
      logger.error("Failed to create project:", error);
      toast({
        title: "Error creating project",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(3px)" bg="overlayDefault" />
      <ModalContent
        bg="bgSurface"
        color="textPrimary"
        borderWidth="DEFAULT"
        borderStyle="solid"
        borderColor="borderDecorative"
        borderRadius="lg"
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="bold"
          py="4"
          px="6"
          borderBottomWidth="DEFAULT"
          borderBottomStyle="solid"
          borderBottomColor="borderDecorative"
        >
          Create New Project
        </ModalHeader>
        <ModalCloseButton
          color="text.secondary"
          _hover={{ bg: "bgHover", color: "textPrimary" }}
        />
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalBody py="4" px="6">
            <VStack spacing="5">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel
                  htmlFor="projectName"
                  fontSize="sm"
                  fontWeight="medium"
                  color="textSecondary"
                >
                  Project Name
                </FormLabel>
                <Input
                  id="projectName"
                  {...register("name", {
                    required: "Project name is required",
                  })}
                  placeholder="Enter project name"
                  bg="bgSurface"
                  borderColor="borderInteractive"
                  _hover={{ borderColor: "borderInteractiveHover" }}
                  _focus={{
                    borderColor: "borderInteractiveFocused",
                    boxShadow: "outline",
                  }}
                />
                {errors.name && (
                  <FormErrorMessage mt="1" fontSize="sm">
                    {errors.name.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel
                  htmlFor="projectDescription"
                  fontSize="sm"
                  fontWeight="medium"
                  color="textSecondary"
                >
                  Description (Optional)
                </FormLabel>
                <Textarea
                  id="projectDescription"
                  {...register("description")}
                  placeholder="Enter a brief description of the project"
                  rows={4}
                  bg="bgSurface"
                  borderColor="borderInteractive"
                  _hover={{ borderColor: "borderInteractiveHover" }}
                  _focus={{
                    borderColor: "borderInteractiveFocused",
                    boxShadow: "outline",
                  }}
                />
                {errors.description && (
                  <FormErrorMessage mt="1" fontSize="sm">
                    {errors.description.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter
            py="3"
            px="6"
            borderTopWidth="DEFAULT"
            borderTopStyle="solid"
            borderTopColor="borderDecorative"
          >
            <Button
              variant="ghost"
              onClick={handleClose}
              mr={3}
              color="text.secondary"
              _hover={{ bg: "bgSubtleHover" }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
              Create Project
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;
