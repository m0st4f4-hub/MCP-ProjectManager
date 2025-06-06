'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
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
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useUniversalMandateStore } from '@/store/universalMandateStore';

const UniversalMandateList: React.FC = () => {
  const mandates = useUniversalMandateStore((s) => s.mandates);
  const fetchMandates = useUniversalMandateStore((s) => s.fetchMandates);
  const removeMandate = useUniversalMandateStore((s) => s.removeMandate);
  const toast = useToast();

  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

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
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">Universal Mandates</Heading>
        <Button as={Link} href="/rules/mandates/new" colorScheme="blue">
          Create Mandate
        </Button>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Priority</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mandates.map((m) => (
            <Tr key={m.id} data-testid="mandate-row">
              <Td>{m.title}</Td>
              <Td>{m.priority}</Td>
              <Td>
                <IconButton
                  as={Link}
                  href={`/rules/mandates/${m.id}/edit`}
                  aria-label="Edit"
                  icon={<EditIcon />}
                  size="sm"
                  mr="2"
                />
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
