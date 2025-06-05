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
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useTemplateStore } from '@/store/templateStore';

const TemplateList: React.FC = () => {
  const templates = useTemplateStore((s) => s.templates);
  const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <Box p="4">
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">Project Templates</Heading>
        <Button as={Link} href="/templates/new" colorScheme="blue">
          Create Template
        </Button>
      </Flex>
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
    </Box>
  );
};

export default TemplateList;
