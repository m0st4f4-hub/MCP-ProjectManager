'use client';
import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@chakra-ui/react';
import EditUniversalMandateForm from '@/components/forms/EditUniversalMandateForm';
import { useUniversalMandateStore } from '@/store/universalMandateStore';

const EditMandatePage: React.FC = () => {
  const params = useParams();
  const mandateId = Array.isArray(params.mandateId)
    ? params.mandateId[0]
    : (params.mandateId as string);
  const { mandates, fetchMandates, updateMandate, removeMandate } =
    useUniversalMandateStore((s) => ({
      mandates: s.mandates,
      fetchMandates: s.fetchMandates,
      updateMandate: s.updateMandate,
      removeMandate: s.removeMandate,
    }));
  const router = useRouter();

  useEffect(() => {
    if (!mandates.length) fetchMandates();
  }, [fetchMandates, mandates.length]);

  const mandate = mandates.find((m) => m.id === mandateId);
  if (!mandate) {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (data: any) => {
    await updateMandate(mandateId, data);
    router.push('/rules/mandates');
  };

  const handleDelete = async () => {
    await removeMandate(mandateId);
    router.push('/rules/mandates');
  };

  return (
    <>
      <EditUniversalMandateForm
        mandate={mandate}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/rules/mandates')}
      />
      <Button colorScheme="red" mt="4" onClick={handleDelete}>
        Delete Mandate
      </Button>
    </>
  );
};

export default EditMandatePage;
