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
  Select,
  Button,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { getUsers } from '@/services/api/users';
import { assignRole, removeRole } from '@/services/api/user_roles';
import { User, UserRole } from '@/types/user';

const UserRolesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>(
    {}
  );
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(0, 100);
      setUsers(data);
    } catch (err: any) {
      toast({
        title: 'Failed to load users',
        description: err.message || String(err),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssign = async (userId: string) => {
    const role = selectedRoles[userId];
    if (!role) return;
    try {
      await assignRole(userId, role);
      toast({ title: 'Role assigned', status: 'success', duration: 2000 });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Failed to assign role',
        description: err.message || String(err),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleRemove = async (userId: string, role: string) => {
    try {
      await removeRole(userId, role);
      toast({ title: 'Role removed', status: 'success', duration: 2000 });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Failed to remove role',
        description: err.message || String(err),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={4} overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Roles</Th>
            <Th>Assign Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.id}>
              <Td>{user.username}</Td>
              <Td>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {user.user_roles.map((r) => (
                    <Button
                      key={r.role_name}
                      size="xs"
                      onClick={() => handleRemove(user.id, r.role_name)}
                    >
                      {r.role_name} ✕
                    </Button>
                  ))}
                </Box>
              </Td>
              <Td>
                <Select
                  placeholder="Select role"
                  size="sm"
                  value={selectedRoles[user.id] || ''}
                  onChange={(e) =>
                    setSelectedRoles({
                      ...selectedRoles,
                      [user.id]: e.target.value as UserRole,
                    })
                  }
                  mr={2}
                  maxW="150px"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                <Button size="sm" onClick={() => handleAssign(user.id)}>
                  Assign
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserRolesPage;
