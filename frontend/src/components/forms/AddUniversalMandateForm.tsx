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
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  universalMandateCreateSchema,
  UniversalMandateCreateData,
} from '@/types/rules';

interface FormFields {
  title: string;
  content: string;
  priority: number;
}

interface AddUniversalMandateFormProps {
  onSubmit: (data: UniversalMandateCreateData) => Promise<void>;
  onCancel: () => void;
}

const AddUniversalMandateForm: React.FC<AddUniversalMandateFormProps> = ({
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
    resolver: zodResolver(universalMandateCreateSchema as any),
    defaultValues: {
      title: '',
      content: '',
      priority: 5,
    },
  });

  const submitHandler: SubmitHandler<FormFields> = async (fields) => {
    try {
      await onSubmit({
        title: fields.title,
        content: fields.content,
        priority: fields.priority,
        is_active: true,
      });
      reset();
    } catch (err) {
      toast({
        title: 'Error creating mandate',
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
        <FormControl isInvalid={!!errors.title} isRequired>
          <FormLabel>Title</FormLabel>
          <Input {...register('title')} placeholder="Title" />
          {errors.title && (
            <FormErrorMessage>{errors.title.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.content} isRequired>
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
          Create Mandate
        </Button>
        <Button variant="ghost" onClick={onCancel} isDisabled={isSubmitting}>
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default AddUniversalMandateForm;
