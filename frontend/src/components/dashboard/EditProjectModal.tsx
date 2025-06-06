"use client";
import * as logger from '@/utils/logger';

import React, { useEffect } from "react";
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
import { ProjectUpdateData, ProjectWithMeta } from "@/types";
import { updateProject } from "@/services/api";
import { useProjectStore } from "@/store/projectStore";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithMeta | null;
}

interface ProjectFormData {
  name: string;
  description?: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>();
  const toast = useToast();
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  useEffect(() => {
    if (project) {
      setValue("name", project.name);
      setValue("description", project.description || "");
    } else {
      setValue("name", "");
      setValue("description", "");
    }
  }, [project, setValue]);

  const onSubmitHandler: SubmitHandler<ProjectFormData> = async (data) => {
    if (!project || !project.id) {
      toast({
        title: "Error",
        description: "Project data is missing, cannot update.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const projectUpdatePayload: ProjectUpdateData = {
      name: data.name,
      description: data.description,
    };
    try {
      await updateProject(project.id, projectUpdatePayload);
      toast({
        title: "Project updated",
        description: `Project "${data.name}" has been successfully updated.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchProjects(); // Refresh the project list
      onClose(); // Close modal after successful submission
    } catch (error) {
      logger.error("Failed to update project:", error);
      toast({
        title: "Error updating project",
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

  // Reset form when modal is closed or projectData changes (to ensure clean state for next open)
  useEffect(() => {
    if (!isOpen) {
      reset({ name: "", description: "" });
    }
  }, [isOpen, reset]);

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
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
          color="textPrimary"
          fontSize="lg"
          fontWeight="bold"
          px="6"
          py="4"
          borderBottomWidth="DEFAULT"
          borderBottomStyle="solid"
          borderBottomColor="borderDecorative"
        >
          Edit Project: {project.name}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalBody as={VStack} spacing="5" px="6" py="4" alignItems="stretch">
            <FormControl
              id={`editProjectName-${project.id}`}
              isInvalid={!!errors.name}
            >
              <FormLabel
                fontSize="sm"
                fontWeight="medium"
                color="textSecondary"
                mb="1.5"
              >
                Project Name
              </FormLabel>
              <Input
                {...register("name", { required: "Project name is required" })}
                placeholder="Enter project name"
                bg="bgSurface"
                _focus={{
                  borderColor: "borderInteractiveFocused",
                  boxShadow: "outline",
                }}
              />
              {errors.name && (
                <FormErrorMessage color="textError" fontSize="sm" mt="1">
                  {errors.name.message}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl id={`editProjectDescription-${project.id}`}>
              <FormLabel
                fontSize="sm"
                fontWeight="medium"
                color="textSecondary"
                mb="1.5"
              >
                Description (Optional)
              </FormLabel>
              <Textarea
                {...register("description")}
                placeholder="Enter a brief description of the project"
                rows={4}
                bg="bgSurface"
                _focus={{
                  borderColor: "borderInteractiveFocused",
                  boxShadow: "outline",
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter
            px="6"
            py="3"
            borderTopWidth="DEFAULT"
            borderTopStyle="solid"
            borderTopColor="borderDecorative"
          >
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditProjectModal;
