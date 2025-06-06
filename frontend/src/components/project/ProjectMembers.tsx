"use client";
import * as logger from '@/utils/logger';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import {
  getProjectMembers,
  removeMemberFromProject,
} from '@/services/api/projects';
import { addMemberToProject } from '@/services/projects';
import { ProjectMember, ProjectMemberRole } from '@/types/project';
import AddProjectMemberForm from '../forms/AddProjectMemberForm';

interface ProjectMembersProps {
  projectId: string;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
  const toast = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  const handleRemoveMember = async (userId: string) => {
    setRemovingId(userId);
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
      toast({
        title: 'Failed to remove member',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      logger.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <Box py={4} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return <Box color="red.500">Error: {error}</Box>;
  }

  return (
    <Box>
      <h3>Project Members</h3>
      {members.length === 0 ? (
        <p>No members yet.</p>
      ) : (
        <List spacing={2} my={2}>
          {members.map((member) => (
            <ListItem key={member.user_id} display="flex" alignItems="center" gap={2}>
              <span>
                {member.user_id} ({member.role})
              </span>
              <Button
                size="xs"
                onClick={() => handleRemoveMember(member.user_id)}
                isLoading={removingId === member.user_id}
              >
                Remove
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      <h4>Add Member</h4>
      <AddProjectMemberForm projectId={projectId} onSuccess={fetchMembers} />
    </Box>
  );
};

export default ProjectMembers;
