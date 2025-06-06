'use client';
import * as logger from '@/utils/logger';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Flex,
} from '@chakra-ui/react';
import { parseDate } from '@/utils/date';
import { AuditLog } from '@/types/audit_log';
import { getAuditLogs } from '@/services/api/audit_logs';

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
      try {
        const data = await getAuditLogs({
          project_id: projectId || undefined,
          user_id: userId || undefined,
          skip: 0,
          limit: 100,
        });
      setLogs(data);
    } catch (err) {
      logger.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box p={4}>
      <Flex mb={4} gap={2} flexWrap="wrap">
        <Input
          placeholder="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          maxW="200px"
        />
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          maxW="200px"
        />
        <Button onClick={fetchLogs} isLoading={loading} minW="100px">
          Apply
        </Button>
      </Flex>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Action</Th>
            <Th>User</Th>
            <Th>Timestamp</Th>
          </Tr>
        </Thead>
        <Tbody>
          {logs.map((log) => (
            <Tr key={log.id}>
              <Td>{log.id}</Td>
              <Td>{log.action}</Td>
              <Td>{log.user_id || '-'}</Td>
              <Td>{parseDate(log.timestamp).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AuditLogViewer;
