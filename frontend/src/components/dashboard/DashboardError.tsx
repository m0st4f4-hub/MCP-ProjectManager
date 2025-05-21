import React from "react";
import { Box, VStack, Heading, Text } from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";

interface DashboardErrorProps {
  message: string;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ message }) => (
  <Box
    as="main"
    w="full"
    h="70vh"
    display="flex"
    justifyContent="center"
    alignItems="center"
    p={{ base: 3, md: 6 }}
  >
    <Box role="alert" w="full" maxW="lg" textAlign="center">
      <VStack spacing={4}>
        <WarningTwoIcon w={12} h={12} color="red.500" />
        <Heading as="h2" size="lg" color="red.500">
          Error Loading Dashboard
        </Heading>
        <Text>
          We encountered an issue fetching the necessary data for the dashboard. Please try refreshing the page. If the problem persists, contact support.
        </Text>
        <Text fontSize="sm" color="gray.500">
          Details: {message}
        </Text>
      </VStack>
    </Box>
  </Box>
);

export default DashboardError; 