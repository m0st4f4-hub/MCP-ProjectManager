'use client';
import React from 'react';
import dynamic from 'next/dynamic';
const AgentManager = dynamic(() => import('@/components/agents/AgentManager'));

const AgentsPage: React.FC = () => {
  return <AgentManager />;
};

export default AgentsPage;
