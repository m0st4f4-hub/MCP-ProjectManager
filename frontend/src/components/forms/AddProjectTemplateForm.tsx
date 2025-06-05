'use client';
import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  projectTemplateCreateSchema,
  ProjectTemplateCreateData,
} from '@/types/project_template';

interface FormFields {
  name: string;
  description?: string | null;
  templateData: string;
}

interface AddProjectTemplateFormProps {
  onSubmit: (data: ProjectTemplateCreateData) => Promise<void>;
  onCancel: () => void;
}

const AddProjectTemplateForm: React.FC<AddProjectTemplateFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormFields>({
    defaultValues: { name: '', description: '', templateData: '{}' },
  });

  const submitHandler = async (fields: FormFields) => {
    try {
      const payload: ProjectTemplateCreateData = {
        name: fields.name,
        description: fields.description || undefined,
        template_data: JSON.parse(fields.templateData || '{}'),
      };
      await onSubmit(payload);
      reset();
    } catch (err) {
      toast({
        title: 'Error creating template',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(submitHandler)}
      p="6"
      bg="bgSurface"
      borderRadius="lg"
      borderWidth="DEFAULT"
      borderColor="borderDecorative"
    >
      <VStack spacing="4" align="stretch">
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Template Name</FormLabel>
          <Input {...register('name')} placeholder="Name" />
          {errors.name && (
            <FormErrorMessage>{errors.name.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input {...register('description')} placeholder="Description" />
        </FormControl>
        <FormControl isInvalid={!!errors.templateData} isRequired>
          <FormLabel>Template JSON</FormLabel>
          <Textarea
            {...register('templateData')}
            rows={6}
            fontFamily="monospace"
          />
          {errors.templateData && (
            <FormErrorMessage>{errors.templateData.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
          Create Template
        </Button>
        <Button variant="ghost" onClick={onCancel} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default AddProjectTemplateForm;
