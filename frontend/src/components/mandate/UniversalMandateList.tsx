'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Input,
  NumberInput,
  NumberInputField,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useMandateStore } from '@/store/mandateStore';
import { UniversalMandateCreateData } from '@/types/rules';

const UniversalMandateList: React.FC = () => {
  const { mandates, fetchMandates, addMandate, removeMandate, loading } =
    useMandateStore((s) => ({
      mandates: s.mandates,
      fetchMandates: s.fetchMandates,
      addMandate: s.addMandate,
      removeMandate: s.removeMandate,
      loading: s.loading,
    }));
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(5);

  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  const handleAdd = async () => {
    const data: UniversalMandateCreateData = {
      title,
      content: description,
      priority,
      is_active: true,
    } as UniversalMandateCreateData;
    try {
      await addMandate(data);
      setTitle('');
      setDescription('');
      setPriority(5);
      toast({ title: 'Mandate created', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error creating mandate',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeMandate(id);
      toast({ title: 'Mandate deleted', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error deleting mandate',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box p="4">
      <Heading size="md" mb="4">
        Universal Mandates
      </Heading>
      <Flex mb="4" gap="2">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          mr="2"
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          mr="2"
        />
        <NumberInput
          maxW="80px"
          mr="2"
          min={1}
          max={10}
          value={priority}
          onChange={(v) => setPriority(Number(v))}
        >
          <NumberInputField />
        </NumberInput>
        <Button onClick={handleAdd} isLoading={loading} colorScheme="blue">
          Add
        </Button>
      </Flex>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Description</Th>
            <Th>Priority</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {mandates.map((m) => (
            <Tr key={m.id} data-testid="mandate-row">
              <Td>{m.title}</Td>
              <Td>{m.content ?? m.description}</Td>
              <Td>{m.priority}</Td>
              <Td>
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  size="sm"
                  onClick={() => handleDelete(m.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UniversalMandateList;
