'use client';

import dynamic from 'next/dynamic';
const ProjectList = dynamic(() => import('@/components/project/ProjectList'));
import React from 'react';

const ProjectsPage: React.FC = () => {
  return <ProjectList />;
};

export default ProjectsPage;
