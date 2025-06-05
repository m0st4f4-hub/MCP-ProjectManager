'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Code, Heading, Text } from '@chakra-ui/react';
import { projectTemplatesApi } from '@/services/api';
import { ProjectTemplate } from '@/types/project_template';

const TemplateDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const templateId = Array.isArray(params.templateId)
    ? params.templateId[0]
    : (params.templateId as string);

  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await projectTemplatesApi.get(templateId);
        setTemplate(data);
      } catch (err) {
        setError('Failed to load template');
        console.error(err);
      }
    };
    if (templateId) fetchTemplate();
  }, [templateId]);

  if (error) return <p>{error}</p>;
  if (!template) return <p>Loading...</p>;

  return (
    <Box p="4">
      <Heading size="md" mb="2">
        {template.name}
      </Heading>
      {template.description && <Text mb="4">{template.description}</Text>}
      <Heading size="sm" mb="2">
        Template Data
      </Heading>
      <Code display="block" whiteSpace="pre" p="2" mb="4">
        {JSON.stringify(template.template_data, null, 2)}
      </Code>
      <Button
        onClick={() => router.push(`/templates/${template.id}/edit`)}
        colorScheme="blue"
      >
        Edit Template
      </Button>
    </Box>
  );
};

export default TemplateDetail;
