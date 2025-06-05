'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AddProjectTemplateForm from '@/components/forms/AddProjectTemplateForm';
import { useTemplateStore } from '@/store/templateStore';

const NewTemplatePage: React.FC = () => {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await addTemplate(data);
    router.push('/templates');
  };

  return (
    <AddProjectTemplateForm
      onSubmit={handleSubmit}
      onCancel={() => router.push('/templates')}
    />
  );
};

export default NewTemplatePage;
