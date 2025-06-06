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
  agentPromptTemplateUpdateSchema,
  AgentPromptTemplateUpdateData,
  AgentPromptTemplate,
} from '@/types/agent_prompt_template';

interface FormFields {
  template_name?: string;
  template_content?: string;
  agent_role_id?: string;
  context_requirements?: string | null;
}

interface EditRuleTemplateFormProps {
  template: AgentPromptTemplate;
  onSubmit: (data: AgentPromptTemplateUpdateData) => Promise<void>;
  onCancel: () => void;
}

const EditRuleTemplateForm: React.FC<EditRuleTemplateFormProps> = ({
  template,
  onSubmit,
  onCancel,
}) => {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormFields>({
    resolver: zodResolver(agentPromptTemplateUpdateSchema as any),
    defaultValues: {
      template_name: template.template_name,
      template_content: template.template_content,
      agent_role_id: template.agent_role_id,
      context_requirements: template.context_requirements ?? '',
    },
  });

  const submitHandler = async (fields: FormFields) => {
    try {
      const payload: AgentPromptTemplateUpdateData = {
        template_name: fields.template_name,
        template_content: fields.template_content,
        agent_role_id: fields.agent_role_id,
        context_requirements: fields.context_requirements,
        is_active: template.is_active,
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
        <FormControl isInvalid={!!errors.template_name}>
          <FormLabel>Name</FormLabel>
          <Input {...register('template_name')} placeholder="Name" />
          {errors.template_name && (
            <FormErrorMessage>{errors.template_name.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.agent_role_id}>
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
        <FormControl isInvalid={!!errors.template_content}>
          <FormLabel>Template Content</FormLabel>
          <Textarea {...register('template_content')} rows={6} />
          {errors.template_content && (
            <FormErrorMessage>{errors.template_content.message}</FormErrorMessage>
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

export default EditRuleTemplateForm;
