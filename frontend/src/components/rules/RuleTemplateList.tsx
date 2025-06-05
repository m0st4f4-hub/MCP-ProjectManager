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
import { useRuleTemplateStore } from '@/store/ruleTemplateStore';

const RuleTemplateList: React.FC = () => {
  const templates = useRuleTemplateStore((s) => s.templates);
  const fetchTemplates = useRuleTemplateStore((s) => s.fetchTemplates);
  const removeTemplate = useRuleTemplateStore((s) => s.removeTemplate);
  const toast = useToast();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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

  return (
    <Box p="4">
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">Rule Templates</Heading>
        <Button as={Link} href="/rules/templates/new" colorScheme="blue">
          Create Template
        </Button>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Agent Role</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((t) => (
            <Tr key={t.id} data-testid="rule-template-row">
              <Td>{t.template_name}</Td>
              <Td>{t.agent_role_id}</Td>
              <Td>
                <IconButton
                  as={Link}
                  href={`/rules/templates/${t.id}/edit`}
                  aria-label="Edit"
                  icon={<EditIcon />}
                  size="sm"
                  mr="2"
                />
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  size="sm"
                  onClick={() => handleDelete(t.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default RuleTemplateList;
