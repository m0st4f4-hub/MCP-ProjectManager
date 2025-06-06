'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AddUniversalMandateForm from '@/components/forms/AddUniversalMandateForm';
import { useUniversalMandateStore } from '@/store/universalMandateStore';

const NewMandatePage: React.FC = () => {
  const addMandate = useUniversalMandateStore((s) => s.addMandate);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await addMandate(data);
    router.push('/rules/mandates');
  };

  return (
    <AddUniversalMandateForm
      onSubmit={handleSubmit}
      onCancel={() => router.push('/rules/mandates')}
    />
  );
};

export default NewMandatePage;
