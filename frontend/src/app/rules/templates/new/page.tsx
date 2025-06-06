'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AddRuleTemplateForm from '@/components/forms/AddRuleTemplateForm';
import { useRuleTemplateStore } from '@/store/ruleTemplateStore';

const NewRuleTemplatePage: React.FC = () => {
  const addTemplate = useRuleTemplateStore((s) => s.addTemplate);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await addTemplate(data);
    router.push('/rules/templates');
  };

  return (
    <AddRuleTemplateForm
      onSubmit={handleSubmit}
      onCancel={() => router.push('/rules/templates')}
    />
  );
};

export default NewRuleTemplatePage;
