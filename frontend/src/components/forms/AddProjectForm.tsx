"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Heading,
  FormErrorMessage,
} from "@chakra-ui/react";
import { ProjectCreateData /*, Project*/ } from "@/types"; // Project is unused
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectCreateSchema } from "@/types/project";
import AppIcon from '../common/AppIcon';
// import { useRouter } from 'next/navigation'; // useRouter is unused

interface AddProjectFormProps {
  onSubmit: (data: ProjectCreateData) => Promise<void>;
  onClose: () => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({
  onSubmit,
  onClose,
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectCreateData>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = async (data: ProjectCreateData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast({
        title: "Project created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error creating project",
        description:
          error instanceof Error ? error.message : "Could not create project.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      bg="bgSurface"
      p="6"
      borderRadius="lg"
      shadow="lg"
      borderWidth="DEFAULT"
      borderStyle="solid"
      borderColor="borderDecorative"
    >
      <VStack spacing="4" align="stretch">
        <Heading
          as="h3"
          size="md"
          color="textPrimary"
          mb="2"
          textAlign="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <AppIcon name="add" boxSize={5} mr={2} />
          Define New Initiative
        </Heading>

        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel htmlFor="projectName">Project Name</FormLabel>
          <Input
            id="projectName"
            {...register("name")}
            placeholder="Enter project name"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="projectDescription">
            Description (Optional)
          </FormLabel>
          <Textarea
            id="projectDescription"
            {...register("description")}
            placeholder="Enter a brief description of the project"
            bg="bgSurface"
            color="textPrimary"
            borderColor="borderInteractive"
            borderWidth="DEFAULT"
            borderRadius="md"
            _hover={{ borderColor: "borderInteractiveHover" }}
            _focus={{ borderColor: "borderFocused", boxShadow: "outline" }}
            _placeholder={{ color: "textPlaceholder" }}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="primary"
          isLoading={isLoading}
          leftIcon={<AppIcon name="add" boxSize={5} />}
        >
          Create Project
        </Button>
      </VStack>
    </Box>
  );
};

export default AddProjectForm;
