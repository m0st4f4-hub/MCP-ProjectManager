'use client';
import React from 'react';
import dynamic from 'next/dynamic';
const TemplateList = dynamic(
  () => import('@/components/template/TemplateList')
);

const TemplatesPage: React.FC = () => {
  return <TemplateList />;
};

export default TemplatesPage;
