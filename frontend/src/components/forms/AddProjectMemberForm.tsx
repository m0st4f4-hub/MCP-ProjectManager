"use client";

import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectMemberRole, projectMemberCreateSchema, type ProjectMemberCreateData } from "@/types/project";
import { addMemberToProject } from "@/services/api/projects";

interface AddProjectMemberFormProps {
  projectId: string;
  onSuccess?: () => void;
}

const AddProjectMemberForm: React.FC<AddProjectMemberFormProps> = ({ projectId, onSuccess }) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectMemberCreateData>({
    resolver: zodResolver(projectMemberCreateSchema),
    defaultValues: { project_id: projectId, user_id: "", role: ProjectMemberRole.MEMBER },
  });

  const onSubmit = async (data: ProjectMemberCreateData) => {
    try {
      await addMemberToProject(projectId, data);
      toast({ title: "Member added", status: "success", duration: 3000, isClosable: true });
      reset();
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Failed to add member",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      bg="bgSurface"
      p="4"
      borderRadius="md"
      borderWidth="DEFAULT"
      borderColor="borderDecorative"
    >
      <VStack spacing="3" align="stretch">
        <FormControl isInvalid={!!errors.user_id} isRequired>
          <FormLabel>User ID</FormLabel>
          <Input placeholder="User ID" {...register("user_id")} />
          <FormErrorMessage>{errors.user_id?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.role} isRequired>
          <FormLabel>Role</FormLabel>
          <Select {...register("role")}> 
            {Object.values(ProjectMemberRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" colorScheme="primary" isLoading={isSubmitting}>
          Add Member
        </Button>
      </VStack>
    </Box>
  );
};

export default AddProjectMemberForm;
