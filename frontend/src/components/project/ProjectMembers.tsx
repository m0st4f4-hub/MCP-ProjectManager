"use client";
import * as logger from '@/utils/logger';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  Spinner,
  Text,
  useToast,
  VStack,
  HStack,
  Heading,
} from '@chakra-ui/react';
import {
  getProjectMembers,
  removeMemberFromProject,
  ProjectMember,
} from '@/services/api/projects';
import AddProjectMemberForm from './AddProjectMemberForm';

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
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch project members.';
      setError(errorMessage);
      logger.error(errorMessage, err);
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
      toast({ title: 'Member removed.', status: 'success', duration: 3000 });
      fetchMembers(); // Refresh list after removing
    } catch (err) {
      const errorMsg = 'Failed to remove member.';
      toast({ title: errorMsg, description: err instanceof Error ? err.message : 'Unknown error', status: 'error', duration: 5000 });
      logger.error(errorMsg, err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500" p={4}>{error}</Text>;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
      <Heading size="md" mb={4}>Project Members</Heading>
      <VStack spacing={4} align="stretch">
        <List spacing={3}>
          {members.length > 0 ? (
            members.map((member) => (
              <ListItem key={member.user_id} d="flex" justifyContent="space-between" alignItems="center">
                <Text>
                  User ID: <Text as="span" fontFamily="monospace">{member.user_id}</Text>
                  <Text as="span" color="gray.500"> ({member.role})</Text>
                </Text>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleRemoveMember(member.user_id)}
                  isLoading={removingId === member.user_id}
                >
                  Remove
                </Button>
              </ListItem>
            ))
          ) : (
            <Text>No members have been added to this project.</Text>
          )}
        </List>
        <AddProjectMemberForm projectId={projectId} onSuccess={fetchMembers} />
      </VStack>
    </Box>
  );
};

export default ProjectMembers;
