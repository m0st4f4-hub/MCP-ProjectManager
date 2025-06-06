'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@chakra-ui/react';
<<<<<<< HEAD
import EditProjectTemplateForm from '@/components/forms/EditProjectTemplateForm';
=======
<<<<<<< HEAD
import TemplateForm from '@/components/templates/TemplateForm';
=======
import EditProjectTemplateForm from '@/components/forms/EditProjectTemplateForm';
>>>>>>> origin/codex/add-delete-buttons-for-templates
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
import { useTemplateStore } from '@/store/templateStore';

const EditTemplatePage: React.FC = () => {
  const params = useParams();
  const templateId = Array.isArray(params.templateId)
    ? params.templateId[0]
    : (params.templateId as string);
  const { templates, fetchTemplates, updateTemplate } =
    useTemplateStore((s) => ({
      templates: s.templates,
      fetchTemplates: s.fetchTemplates,
      updateTemplate: s.updateTemplate,
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

  return (
    <>
<<<<<<< HEAD
      <EditProjectTemplateForm
=======
<<<<<<< HEAD
      <TemplateForm
=======
      <EditProjectTemplateForm
>>>>>>> origin/codex/add-delete-buttons-for-templates
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
        template={template}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/templates')}
      />
<<<<<<< HEAD
=======
<<<<<<< HEAD
      <Button colorScheme="red" mt="4" onClick={handleDelete}>
=======
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
      <Button
        as={Link}
        href={`/templates/${templateId}/delete`}
        colorScheme="red"
        mt={4}
      >
<<<<<<< HEAD
=======
>>>>>>> origin/codex/add-delete-buttons-for-templates
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
        Delete Template
      </Button>
    </>
  );
};

export default EditTemplatePage;
