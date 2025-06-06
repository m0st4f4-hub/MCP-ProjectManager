"use client";
import * as logger from '@/utils/logger';

import React, { useEffect, useState } from 'react';
import {
  getProjectMembers,
  addMemberToProject,
  removeMemberFromProject,
} from '@/services/projects';
import { useToast } from '@chakra-ui/react';
import { ProjectMember, ProjectMemberRole } from '@/types/project';

interface ProjectMembersProps {
  projectId: string;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
  const toast = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<ProjectMemberRole | ''>( '');

  const fetchMembers = async () => {
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      setError('Failed to fetch project members');
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUserId || !newMemberRole) return;

    try {
      await addMemberToProject(projectId, {
        user_id: newMemberUserId,
        role: newMemberRole as ProjectMemberRole,
      });
      setNewMemberUserId('');
      setNewMemberRole('');
      toast({
        title: 'Member added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchMembers();
    } catch (err) {
<<<<<<< HEAD
      alert('Failed to add member');
      logger.error(err);
=======
      toast({
        title: 'Failed to add member',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(err);
>>>>>>> codex/add-api-calls-in-projects.ts
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberFromProject(projectId, userId);
      toast({
        title: 'Member removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchMembers();
    } catch (err) {
<<<<<<< HEAD
      alert('Failed to remove member');
      logger.error(err);
=======
      toast({
        title: 'Failed to remove member',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(err);
>>>>>>> codex/add-api-calls-in-projects.ts
    }
  };

  if (loading) {
    return <div>Loading members...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Project Members</h3>
      {
        members.length === 0 ? (
          <p>No members yet.</p>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member.user_id}>
                {member.user_id} ({member.role})
                <button onClick={() => handleRemoveMember(member.user_id)}>Remove</button>
              </li>
            ))}
          </ul>
        )
      }

      <h4>Add Member</h4>
      <form onSubmit={handleAddMember}>
        <div>
          <label htmlFor="userId">User ID:</label>
          <input
            id="userId"
            type="text"
            value={newMemberUserId}
            onChange={(e) => setNewMemberUserId(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value as ProjectMemberRole)}
          >
            <option value="">Select Role</option>
            {Object.values(ProjectMemberRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add Member</button>
      </form>
    </div>
  );
};

export default ProjectMembers;