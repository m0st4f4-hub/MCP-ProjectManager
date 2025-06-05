'use client';

import dynamic from 'next/dynamic';
const ProjectDetail = dynamic(
  () => import('@/components/project/ProjectDetail')
);
import React from 'react';

const ProjectDetailPage: React.FC = () => {
  return <ProjectDetail />;
};

export default ProjectDetailPage;
