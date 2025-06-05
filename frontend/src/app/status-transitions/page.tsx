'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Button,
  Flex,
} from '@chakra-ui/react';
import { statusTransitionsApi } from '@/services/api/statusTransitions';
import { TaskStatus } from '@/types/task';
import { StatusTransition } from '@/types/statusTransition';
import { handleApiError } from '@/lib/apiErrorHandler';

const StatusTransitionsPage: React.FC = () => {
  const [transitions, setTransitions] = useState<StatusTransition[]>([]);
  const [fromStatus, setFromStatus] = useState<TaskStatus | ''>('');
  const [toStatus, setToStatus] = useState<TaskStatus | ''>('');
  const [loading, setLoading] = useState(false);

  const fetchTransitions = async () => {
    try {
      const result = await statusTransitionsApi.list();
      setTransitions(result);
    } catch (err) {
      handleApiError(err, 'Failed to load transitions');
    }
  };

  useEffect(() => {
    fetchTransitions();
  }, []);

  const handleAdd = async () => {
    if (!fromStatus || !toStatus) return;
    setLoading(true);
    try {
      await statusTransitionsApi.create(fromStatus as TaskStatus, toStatus as TaskStatus);
      setFromStatus('');
      setToStatus('');
      await fetchTransitions();
    } catch (err) {
      handleApiError(err, 'Failed to add transition');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await statusTransitionsApi.remove(id);
      await fetchTransitions();
    } catch (err) {
      handleApiError(err, 'Failed to delete transition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="4">
      <Flex mb="4" gap="2">
        <Select
          placeholder="From"
          value={fromStatus}
          onChange={(e) => setFromStatus(e.target.value as TaskStatus)}
          size="sm"
        >
          {Object.values(TaskStatus).map((s) => (
            <option key={`from-${s}`} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          placeholder="To"
          value={toStatus}
          onChange={(e) => setToStatus(e.target.value as TaskStatus)}
          size="sm"
        >
          {Object.values(TaskStatus).map((s) => (
            <option key={`to-${s}`} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button size="sm" onClick={handleAdd} isLoading={loading}>
          Add
        </Button>
      </Flex>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transitions.map((t) => (
              <Tr key={t.id} data-testid={`row-${t.id}`}>
                <Td>{t.from_status}</Td>
                <Td>{t.to_status}</Td>
                <Td>
                  <Button size="xs" onClick={() => handleDelete(t.id)} isLoading={loading}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StatusTransitionsPage;
