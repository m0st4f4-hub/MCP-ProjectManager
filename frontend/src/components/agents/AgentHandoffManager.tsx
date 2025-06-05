'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { handoffApi } from '@/services/api/handoff';
import type {
  HandoffCriteria,
  HandoffCriteriaCreateData,
} from '@/types/handoff';

interface AgentHandoffManagerProps {
  agentRoleId: string;
}

const defaultForm: Omit<HandoffCriteriaCreateData, 'agent_role_id'> = {
  criteria: '',
  description: '',
  target_agent_role: '',
  is_active: true,
};

const AgentHandoffManager: React.FC<AgentHandoffManagerProps> = ({
  agentRoleId,
}) => {
  const [criteriaList, setCriteriaList] = useState<HandoffCriteria[]>([]);
  const [form, setForm] = useState(defaultForm);
  const toast = useToast();

  const fetchCriteria = async () => {
    try {
      const data = await handoffApi.list(agentRoleId);
      setCriteriaList(data);
    } catch (err) {
      toast({
        title: 'Failed to load criteria',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchCriteria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAdd = async () => {
    if (!form.criteria.trim()) return;
    try {
      const newCriteria = await handoffApi.create({
        agent_role_id: agentRoleId,
        ...form,
      });
      setCriteriaList((prev) => [...prev, newCriteria]);
      setForm(defaultForm);
      toast({ title: 'Criteria added', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Failed to add', status: 'error', duration: 4000 });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await handoffApi.remove(id);
      setCriteriaList((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Deleted', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Delete failed', status: 'error', duration: 4000 });
    }
  };

  return (
    <Box>
      <Flex gap={2} mb={4} flexWrap="wrap">
        <Input
          placeholder="Criteria"
          name="criteria"
          value={form.criteria}
          onChange={handleChange}
        />
        <Input
          placeholder="Description"
          name="description"
          value={form.description || ''}
          onChange={handleChange}
        />
        <Input
          placeholder="Target Role"
          name="target_agent_role"
          value={form.target_agent_role || ''}
          onChange={handleChange}
        />
        <Checkbox
          name="is_active"
          isChecked={form.is_active}
          onChange={handleChange}
        >
          Active
        </Checkbox>
        <Button onClick={handleAdd}>Add Criteria</Button>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Criteria</Th>
            <Th>Description</Th>
            <Th>Target</Th>
            <Th>Active</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {criteriaList.map((c) => (
            <Tr key={c.id}>
              <Td>{c.criteria}</Td>
              <Td>{c.description}</Td>
              <Td>{c.target_agent_role}</Td>
              <Td>{c.is_active ? 'Yes' : 'No'}</Td>
              <Td>
                <Button size="sm" onClick={() => handleDelete(c.id)}>
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AgentHandoffManager;
