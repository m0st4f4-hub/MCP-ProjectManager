'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const AgentForbiddenActions: React.FC = () => {
  const [action, setAction] = useState('');
  const [actions, setActions] = useState<string[]>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = action.trim();
    if (!trimmed) return;
    setActions((prev) => [...prev, trimmed]);
    setAction('');
  };

  const handleRemove = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box p={4}>
      <Box as="form" onSubmit={handleAdd} mb={4}>
        <FormControl>
          <FormLabel htmlFor="forbidden-action">Forbidden Action</FormLabel>
          <Input
            id="forbidden-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Enter action"
          />
        </FormControl>
        <Button mt={2} type="submit" colorScheme="blue">
          Add Action
        </Button>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Action</Th>
            <Th>Remove</Th>
          </Tr>
        </Thead>
        <Tbody>
          {actions.map((act, idx) => (
            <Tr key={idx} data-testid="forbidden-action-row">
              <Td>{act}</Td>
              <Td>
                <IconButton
                  aria-label="Remove"
                  icon={<DeleteIcon />}
                  size="sm"
                  onClick={() => handleRemove(idx)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AgentForbiddenActions;
