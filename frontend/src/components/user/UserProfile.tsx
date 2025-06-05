import * as logger from '@/utils/logger';
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { getUserById } from "@/services/api/users";
import { User } from "@/types/user";

interface UserProfileProps {
  userId: string; // Assuming the user ID is passed as a prop
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err: any) {
        logger.error("Failed to fetch user:", err);
        setError(err.message || "An error occurred while fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading User Profile...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Text>User not found.</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="xl">User Profile</Heading>
        <FormControl id="user-id">
          <FormLabel>ID</FormLabel>
          <Input type="text" value={user.id} isReadOnly />
        </FormControl>
        <FormControl id="username">
          <FormLabel>Username</FormLabel>
          <Input type="text" value={user.username} isReadOnly />
        </FormControl>
        {/* Add other user details if available in the User type */}
        {/* For example: */}
        {/* <FormControl id="is-active">
          <FormLabel>Active</FormLabel>
          <Checkbox isChecked={user.is_active} isReadOnly>Active</Checkbox>
        </FormControl> */}
      </VStack>
    </Box>
  );
};

export default UserProfile; 