'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableContainer,
  Text,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { errorProtocolsApi } from '@/services/api/error_protocols';
import type {
  ErrorProtocol,
  ErrorProtocolCreateData,
} from '@/types/error_protocol';

interface ErrorProtocolManagerProps {
  agentRoleId: string;
}

const defaultForm: Omit<ErrorProtocolCreateData, 'agent_role_id'> = {
  error_type: '',
  protocol: '',
  priority: 5,
  is_active: true,
};

const ErrorProtocolManager: React.FC<ErrorProtocolManagerProps> = ({
  agentRoleId,
}) => {
  const toast = useToast();
  const [protocols, setProtocols] = useState<ErrorProtocol[] | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const loadProtocols = async () => {
    try {
      const data = await errorProtocolsApi.list(agentRoleId);
      setProtocols(data);
    } catch (err) {
      toast({
        title: 'Failed to load protocols',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadProtocols();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRoleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreate = async () => {
    if (!form.error_type.trim() || !form.protocol.trim()) return;
    setLoading(true);
    try {
      await errorProtocolsApi.create({ agent_role_id: agentRoleId, ...form });
      setForm(defaultForm);
      await loadProtocols();
      toast({
        title: 'Protocol added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to add protocol',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await errorProtocolsApi.remove(id);
      await loadProtocols();
      toast({
        title: 'Protocol removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to remove protocol',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!protocols) {
    return (
      <Flex justify="center" align="center" p="4" minH="100px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex mb={2} gap={2} flexWrap="wrap">
        <Input
          placeholder="Error Type"
          name="error_type"
          value={form.error_type}
          onChange={handleChange}
        />
        <Input
          placeholder="Protocol"
          name="protocol"
          value={form.protocol}
          onChange={handleChange}
        />
        <Input
          placeholder="Priority"
          name="priority"
          type="number"
          value={form.priority}
          onChange={handleChange}
          width="90px"
        />
        <Checkbox
          name="is_active"
          isChecked={form.is_active}
          onChange={handleChange}
        >
          Is Active
        </Checkbox>
        <Button
          onClick={handleCreate}
          isLoading={loading}
          disabled={!form.error_type.trim() || !form.protocol.trim()}
        >
          Add
        </Button>
      </Flex>
      {protocols.length === 0 ? (
        <Text>No error protocols.</Text>
      ) : (
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Error Type</Th>
                <Th>Protocol</Th>
                <Th>Priority</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {protocols.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.error_type}</Td>
                  <Td>{p.protocol}</Td>
                  <Td>{p.priority}</Td>
                  <Td>{p.is_active ? 'Yes' : 'No'}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ErrorProtocolManager;
