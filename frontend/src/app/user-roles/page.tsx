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
import { getUsers } from '@/services/api/users';
import { userRolesApi } from '@/services/api/user_roles';
import { User, UserRole } from '@/types/user';
import { handleApiError } from '@/lib/apiErrorHandler';

const UserRolesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, UserRole | ''>
  >({});

  const fetchUsers = async () => {
    try {
      const result = await getUsers(0, 100);
      setUsers(result);
    } catch (err) {
      handleApiError(err, 'Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssign = async (userId: string) => {
    const role = selectedRoles[userId];
    if (!role) return;
    setLoading(true);
    try {
      await userRolesApi.assign(userId, role);
      await fetchUsers();
      setSelectedRoles((prev) => ({ ...prev, [userId]: '' }));
    } catch (err) {
      handleApiError(err, 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string, role: UserRole) => {
    setLoading(true);
    try {
      await userRolesApi.remove(userId, role);
      await fetchUsers();
    } catch (err) {
      handleApiError(err, 'Failed to remove role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="4">
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Roles</Th>
              <Th>Assign Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((u) => (
              <Tr key={u.id} data-testid="user-row">
                <Td>{u.username}</Td>
                <Td>
                  <Flex wrap="wrap" gap="2">
                    {u.user_roles.map((r) => (
                      <Button
                        key={r.role_name}
                        size="xs"
                        onClick={() => handleRemove(u.id, r.role_name)}
                        data-testid={`remove-${u.id}-${r.role_name}`}
                      >
                        {r.role_name} ✕
                      </Button>
                    ))}
                  </Flex>
                </Td>
                <Td>
                  <Flex>
                    <Select
                      size="sm"
                      value={selectedRoles[u.id] || ''}
                      onChange={(e) =>
                        setSelectedRoles((prev) => ({
                          ...prev,
                          [u.id]: e.target.value as UserRole,
                        }))
                      }
                      placeholder="Select role"
                      mr="2"
                      data-testid={`select-${u.id}`}
                    >
                      {Object.values(UserRole).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleAssign(u.id)}
                      isDisabled={!selectedRoles[u.id]}
                      isLoading={loading}
                      data-testid={`assign-${u.id}`}
                    >
                      Add
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserRolesPage;
