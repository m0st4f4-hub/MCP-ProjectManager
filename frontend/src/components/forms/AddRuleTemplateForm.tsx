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
  agentPromptTemplateCreateSchema,
  AgentPromptTemplateCreateData,
} from '@/types/agent_prompt_template';

interface FormFields {
  template_name: string;
  template_content: string;
  agent_role_id: string;
  context_requirements?: string | null;
}

interface AddRuleTemplateFormProps {
  onSubmit: (data: AgentPromptTemplateCreateData) => Promise<void>;
  onCancel: () => void;
}

const AddRuleTemplateForm: React.FC<AddRuleTemplateFormProps> = ({
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
    resolver: zodResolver(agentPromptTemplateCreateSchema as any),
    defaultValues: {
      template_name: '',
      template_content: '',
      agent_role_id: '',
      context_requirements: '',
    },
  });

  const submitHandler: SubmitHandler<FormFields> = async (fields) => {
    try {
      const payload: AgentPromptTemplateCreateData = {
        template_name: fields.template_name,
        template_content: fields.template_content,
        agent_role_id: fields.agent_role_id,
        context_requirements: fields.context_requirements || undefined,
        is_active: true,
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
        <FormControl isInvalid={!!errors.template_name} isRequired>
          <FormLabel>Name</FormLabel>
          <Input {...register('template_name')} placeholder="Name" />
          {errors.template_name && (
            <FormErrorMessage>{errors.template_name.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.agent_role_id} isRequired>
          <FormLabel>Agent Role ID</FormLabel>
          <Input {...register('agent_role_id')} placeholder="Agent Role ID" />
          {errors.agent_role_id && (
            <FormErrorMessage>{errors.agent_role_id.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>Context Requirements</FormLabel>
          <Input {...register('context_requirements')} placeholder="Context" />
        </FormControl>
        <FormControl isInvalid={!!errors.template_content} isRequired>
          <FormLabel>Template Content</FormLabel>
          <Textarea {...register('template_content')} rows={6} />
          {errors.template_content && (
            <FormErrorMessage>{errors.template_content.message}</FormErrorMessage>
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

export default AddRuleTemplateForm;
