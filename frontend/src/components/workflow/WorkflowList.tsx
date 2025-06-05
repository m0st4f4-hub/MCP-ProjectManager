'use client';
import React, { useEffect, useState } from 'react';
import { Box, Heading, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';
import { workflowsApi } from '@/services/api/workflows';
import { Workflow } from '@/types/workflow';

const WorkflowList: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    workflowsApi
      .list()
      .then(setWorkflows)
      .catch((err) => console.error('Failed to fetch workflows', err));
  }, []);

  return (
    <Box p="4">
      <Heading size="md" mb="4">
        Workflows
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
          </Tr>
        </Thead>
        <Tbody>
          {workflows.map((w) => (
            <Tr key={w.id} data-testid="workflow-row">
              <Td>{w.name}</Td>
              <Td>{w.workflow_type}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default WorkflowList;
