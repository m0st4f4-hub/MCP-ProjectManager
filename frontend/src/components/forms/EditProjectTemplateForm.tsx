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
  projectTemplateUpdateSchema,
  ProjectTemplateUpdateData,
  ProjectTemplate,
} from '@/types/project_template';

interface FormFields {
  name?: string;
  description?: string | null;
  templateData?: string;
}

interface EditTemplateFormProps {
  template: ProjectTemplate;
  onSubmit: (data: ProjectTemplateUpdateData) => Promise<void>;
  onCancel: () => void;
}

const EditProjectTemplateForm: React.FC<EditTemplateFormProps> = ({
  template,
  onSubmit,
  onCancel,
}) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(
      projectTemplateUpdateSchema.extend({
        template_data:
          projectTemplateUpdateSchema.shape.template_data?.transform(
            () => ({})
          ),
      })
    ),
    defaultValues: {
      name: template.name,
      description: template.description ?? '',
      templateData: JSON.stringify(template.template_data, null, 2),
    },
  });

  const submitHandler = async (fields: FormFields) => {
    try {
      const payload: ProjectTemplateUpdateData = {
        name: fields.name,
        description: fields.description,
        template_data: fields.templateData
          ? JSON.parse(fields.templateData)
          : undefined,
      };
      await onSubmit(payload);
    } catch (err) {
      toast({
        title: 'Error updating template',
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
        <FormControl isInvalid={!!errors.name}>
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
        <FormControl isInvalid={!!errors.templateData}>
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
          Update Template
        </Button>
        <Button variant="ghost" onClick={onCancel} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default EditProjectTemplateForm;
