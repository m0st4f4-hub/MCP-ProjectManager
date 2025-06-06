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
  universalMandateUpdateSchema,
  UniversalMandateUpdateData,
  UniversalMandate,
} from '@/types/rules';

interface FormFields {
  title?: string;
  content?: string;
  priority?: number;
}

interface EditUniversalMandateFormProps {
  mandate: UniversalMandate;
  onSubmit: (data: UniversalMandateUpdateData) => Promise<void>;
  onCancel: () => void;
}

const EditUniversalMandateForm: React.FC<EditUniversalMandateFormProps> = ({
  mandate,
  onSubmit,
  onCancel,
}) => {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormFields>({
    resolver: zodResolver(universalMandateUpdateSchema as any),
    defaultValues: {
      title: mandate.title,
      content: mandate.content,
      priority: mandate.priority,
    },
  });

  const submitHandler = async (fields: FormFields) => {
    try {
      const payload: UniversalMandateUpdateData = {
        title: fields.title,
        content: fields.content,
        priority: fields.priority,
        is_active: mandate.is_active,
      };
      await onSubmit(payload);
    } catch (err) {
      toast({
        title: 'Error updating mandate',
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
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title')} placeholder="Title" />
          {errors.title && (
            <FormErrorMessage>{errors.title.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.content}>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('content')} rows={4} />
          {errors.content && (
            <FormErrorMessage>{errors.content.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.priority}>
          <FormLabel>Priority</FormLabel>
          <Input type="number" {...register('priority', { valueAsNumber: true })} />
        </FormControl>
        <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
          Update Mandate
        </Button>
        <Button variant="ghost" onClick={onCancel} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default EditUniversalMandateForm;
