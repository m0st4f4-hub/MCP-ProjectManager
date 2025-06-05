import * as logger from '@/utils/logger';
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { parseDate } from "@/utils/date";
import { getAuditLogsByEntity } from "@/services/api/audit_logs";
import { AuditLog } from "@/types/audit_log";

interface AuditLogListForEntityProps {
  entityType: string; // e.g., 'project', 'task'
  entityId: string; // The ID of the specific entity
}

const AuditLogListForEntity: React.FC<AuditLogListForEntityProps> = ({
  entityType,
  entityId,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch audit logs for the specified entity
        const auditLogs = await getAuditLogsByEntity(entityType, entityId);
        setLogs(auditLogs);
      } catch (err: any) {
        logger.error("Failed to fetch audit logs:", err);
        setError(err.message || "An error occurred while fetching audit logs.");
      } finally {
        setIsLoading(false);
      }
    };

    if (entityType && entityId) {
      fetchLogs();
    }
  }, [entityType, entityId]);

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="md" />
        <Text mt={2}>Loading Audit Logs...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h3" size="lg">Audit Logs for {entityType} {entityId}</Heading>

        {logs.length === 0 ? (
          <Text>No audit logs found for this entity.</Text>
        ) : (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Action</Th>
                  <Th>User ID</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log) => (
                  <Tr key={log.id}>
                    <Td>{parseDate(log.timestamp).toLocaleString()}</Td>
                    <Td>{log.action}</Td>
                    <Td>{log.user_id || "System"}</Td>
                    <Td>
                      {log.details ? (
                        <Text fontSize="sm">
                          {JSON.stringify(log.details, null, 2)}
                        </Text>
                      ) : (
                        "N/A"
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>
    </Box>
  );
};

export default AuditLogListForEntity; 