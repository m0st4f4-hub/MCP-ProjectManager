'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import TemplateForm from '@/components/templates/TemplateForm';
import { useTemplateStore } from '@/store/templateStore';

const NewTemplatePage: React.FC = () => {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await addTemplate(data);
    router.push('/templates');
  };

  return (
    <TemplateForm
      onSubmit={handleSubmit}
      onCancel={() => router.push('/templates')}
    />
  );
};

export default NewTemplatePage;
