'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Checkbox,
  VStack,
} from '@chakra-ui/react';
import { workflowsApi } from '@/services/api';
import type { Workflow, WorkflowCreateData, WorkflowUpdateData } from '@/types/workflow';

const WorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [newWorkflow, setNewWorkflow] = useState<WorkflowCreateData>({
    name: '',
    workflow_type: '',
    description: '',
    entry_criteria: '',
    success_criteria: '',
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<WorkflowUpdateData>({});

  const fetchData = async () => {
    try {
      const data = await workflowsApi.list();
      setWorkflows(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    await workflowsApi.create(newWorkflow);
    setNewWorkflow({
      name: '',
      workflow_type: '',
      description: '',
      entry_criteria: '',
      success_criteria: '',
      is_active: true,
    });
    fetchData();
  };

  const handleUpdate = async (id: string) => {
    await workflowsApi.update(id, editData);
    setEditingId(null);
    setEditData({});
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await workflowsApi.delete(id);
    fetchData();
  };

  return (
    <Box p="4">
      <Heading size="md" mb="4">Workflows</Heading>
      <VStack align="start" spacing="2" mb="6">
        <Input
          placeholder="Name"
          value={newWorkflow.name}
          onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
        />
        <Input
          placeholder="Type"
          value={newWorkflow.workflow_type}
          onChange={(e) =>
            setNewWorkflow({ ...newWorkflow, workflow_type: e.target.value })
          }
        />
        <Input
          placeholder="Description"
          value={newWorkflow.description || ''}
          onChange={(e) =>
            setNewWorkflow({ ...newWorkflow, description: e.target.value })
          }
        />
        <Button onClick={handleCreate} colorScheme="blue">
          Create Workflow
        </Button>
      </VStack>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Active</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {workflows.map((wf) => (
            <Tr key={wf.id} data-testid="workflow-row">
              <Td>
                {editingId === wf.id ? (
                  <Input
                    value={editData.name ?? wf.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  wf.name
                )}
              </Td>
              <Td>
                {editingId === wf.id ? (
                  <Input
                    value={editData.workflow_type ?? wf.workflow_type}
                    onChange={(e) =>
                      setEditData({ ...editData, workflow_type: e.target.value })
                    }
                  />
                ) : (
                  wf.workflow_type
                )}
              </Td>
              <Td>
                {editingId === wf.id ? (
                  <Checkbox
                    isChecked={editData.is_active ?? wf.is_active}
                    onChange={(e) =>
                      setEditData({ ...editData, is_active: e.target.checked })
                    }
                  />
                ) : wf.is_active ? (
                  'Yes'
                ) : (
                  'No'
                )}
              </Td>
              <Td>
                {editingId === wf.id ? (
                  <>
                    <Button size="sm" onClick={() => handleUpdate(wf.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      ml="2"
                      onClick={() => {
                        setEditingId(null);
                        setEditData({});
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={() => {
                      setEditingId(wf.id);
                      setEditData(wf);
                    }}>
                      Edit
                    </Button>
                    <Button size="sm" ml="2" onClick={() => handleDelete(wf.id)}>
                      Delete
                    </Button>
                  </>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default WorkflowsPage;
