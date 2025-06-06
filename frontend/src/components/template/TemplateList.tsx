'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
<<<<<<< HEAD
  useToast,
=======
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
>>>>>>> origin/codex/add-delete-buttons-for-templates
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useTemplateStore } from '@/store/templateStore';
import DataTable, { Column, Action } from '../common/DataTable';

const TemplateList: React.FC = () => {
  const templates = useTemplateStore((s) => s.templates);
  const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

<<<<<<< HEAD
  const handleDelete = async (id: string) => {
    try {
      await removeTemplate(id);
      toast({ title: 'Template deleted', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error deleting template',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  const columns: Column<typeof templates[number]>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
  ];

  const actions: Action<typeof templates[number]>[] = [
    {
      label: 'edit',
      render: (t) => (
        <IconButton
          as={Link}
          href={`/templates/${t.id}/edit`}
          aria-label="Edit"
          icon={<EditIcon />}
          size="sm"
          mr="2"
        />
      ),
    },
    {
      label: 'delete',
      render: (t) => (
        <IconButton
          aria-label="Delete"
          icon={<DeleteIcon />}
          size="sm"
          onClick={() => handleDelete(t.id)}
        />
      ),
    },
  ];

=======
>>>>>>> origin/codex/add-delete-buttons-for-templates
  return (
    <Box p="4">
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">Project Templates</Heading>
        <Button as={Link} href="/templates/new" colorScheme="blue">
          Create Template
        </Button>
      </Flex>
<<<<<<< HEAD
      <DataTable data={templates} columns={columns} actions={actions} />
=======
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((t) => (
            <Tr key={t.id} data-testid="template-row">
              <Td>{t.name}</Td>
              <Td>{t.description}</Td>
              <Td>
                <IconButton
                  as={Link}
                  href={`/templates/${t.id}/edit`}
                  aria-label="Edit"
                  icon={<EditIcon />}
                  size="sm"
                  mr="2"
                />
                <IconButton
                  as={Link}
                  href={`/templates/${t.id}/delete`}
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  size="sm"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
>>>>>>> origin/codex/add-delete-buttons-for-templates
    </Box>
  );
};

export default TemplateList;
