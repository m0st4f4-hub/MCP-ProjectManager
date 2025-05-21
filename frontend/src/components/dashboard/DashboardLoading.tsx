import React from "react";
import { Box, VStack, Spinner, Text } from "@chakra-ui/react";

const DashboardLoading: React.FC = () => (
  <Box
    as="main"
    w="full"
    h="70vh"
    display="flex"
    justifyContent="center"
    alignItems="center"
    p={{ base: 3, md: 6 }}
    aria-busy="true"
  >
    <VStack spacing={4}>
      <Spinner size="xl" />
      <Text>Loading Dashboard Data...</Text>
    </VStack>
  </Box>
);

export default DashboardLoading; 