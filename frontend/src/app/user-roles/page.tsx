'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Box,
} from '@chakra-ui/react'
import { getUsers } from '@/services/api/users'
import { assignRole, removeRole } from '@/services/api/userRoles'
import { User, UserRole, UserRoleObject } from '@/types/user'

const UserRolesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roleSelections, setRoleSelections] = useState<Record<string, UserRole | ''>>({})

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers(0, 100)
        setUsers(data)
      } catch (err) {
        console.error('Failed to load users', err)
      }
    }
    loadUsers()
  }, [])

  const handleAssign = async (userId: string) => {
    const role = roleSelections[userId]
    if (!role) return
    try {
      const newRole: UserRoleObject = await assignRole(userId, role)
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, user_roles: [...u.user_roles, newRole] } : u,
        ),
      )
      setRoleSelections(prev => ({ ...prev, [userId]: '' }))
    } catch (err) {
      console.error('Failed to assign role', err)
    }
  }

  const handleRemove = async (userId: string, role: UserRole) => {
    try {
      await removeRole(userId, role)
      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, user_roles: u.user_roles.filter(r => r.role_name !== role) }
            : u,
        ),
      )
    } catch (err) {
      console.error('Failed to remove role', err)
    }
  }

  return (
    <Box p={4}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Roles</Th>
            <Th>Assign Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map(user => (
            <Tr key={user.id}>
              <Td>{user.username}</Td>
              <Td>
                {user.user_roles.map(role => (
                  <Button
                    key={role.role_name}
                    size="sm"
                    mr={2}
                    onClick={() => handleRemove(user.id, role.role_name)}
                  >
                    {role.role_name}
                  </Button>
                ))}
              </Td>
              <Td>
                <Select
                  placeholder="Select role"
                  value={roleSelections[user.id] || ''}
                  onChange={e =>
                    setRoleSelections(prev => ({
                      ...prev,
                      [user.id]: e.target.value as UserRole,
                    }))
                  }
                  mb={2}
                >
                  {Object.values(UserRole).map(r => (
                    <option key={r} value={r}>
                      {r}
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
  )
}

export default UserRolesPage
