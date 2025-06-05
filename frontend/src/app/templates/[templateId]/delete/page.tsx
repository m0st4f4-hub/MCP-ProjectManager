'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTemplateStore } from '@/store/templateStore';

const DeleteTemplatePage = () => {
  const params = useParams();
  const templateId = Array.isArray(params.templateId)
    ? params.templateId[0]
    : (params.templateId as string);
  const removeTemplate = useTemplateStore((s) => s.removeTemplate);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      await removeTemplate(templateId);
      router.push('/templates');
    };
    run();
  }, [templateId, removeTemplate, router]);

  return <p>Deleting...</p>;
};

export default DeleteTemplatePage;
