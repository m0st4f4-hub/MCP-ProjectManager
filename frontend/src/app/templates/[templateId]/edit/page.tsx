'use client';
import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
const EditProjectTemplateForm = dynamic(
  () => import('@/components/forms/EditProjectTemplateForm')
);
import { useTemplateStore } from '@/store/templateStore';

const EditTemplatePage: React.FC = () => {
  const params = useParams();
  const templateId = Array.isArray(params.templateId)
    ? params.templateId[0]
    : (params.templateId as string);
  const { templates, fetchTemplates, updateTemplate, removeTemplate } =
    useTemplateStore((s) => ({
      templates: s.templates,
      fetchTemplates: s.fetchTemplates,
      updateTemplate: s.updateTemplate,
      removeTemplate: s.removeTemplate,
    }));
  const router = useRouter();

  useEffect(() => {
    if (!templates.length) fetchTemplates();
  }, [fetchTemplates, templates.length]);

  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (data: any) => {
    await updateTemplate(templateId, data);
    router.push('/templates');
  };

  const handleDelete = async () => {
    await removeTemplate(templateId);
    router.push('/templates');
  };

  return (
    <>
      <EditProjectTemplateForm
        template={template}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/templates')}
      />
      <Button colorScheme="red" mt="4" onClick={handleDelete}>
        Delete Template
      </Button>
    </>
  );
};

export default EditTemplatePage;
