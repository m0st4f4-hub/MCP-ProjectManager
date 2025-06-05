import * as logger from '@/utils/logger';
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  Button,
  Input,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { getAgents } from "@/services/api/agents";
import { Agent } from "@/types/agent";

// Basic component to display individual agent info (will be improved later)
const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  return (
    <Box p={4} borderWidth={1} borderRadius={8} boxShadow="sm">
      <Heading size="md">{agent.name}</Heading>
      <Text mt={2}>ID: {agent.id}</Text>
      {agent.description && <Text mt={1}>Description: {agent.description}</Text>}
      <Text mt={1}>Archived: {agent.is_archived ? "Yes" : "No"}</Text>
      {/* Add more agent details here as needed */}
    </Box>
  );
};

const AgentList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

  // Effect to fetch agents (now includes search query and pagination)
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Calculate skip value
        const skip = currentPage * itemsPerPage;
        // Fetch agents with the current search query and pagination parameters
        const agentData = await getAgents(skip, itemsPerPage, searchQuery);
        setAgents(agentData);
      } catch (err: any) {
        logger.error("Failed to fetch agents:", err);
        setError(err.message || "An error occurred while fetching agents.");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search input and trigger fetch on page change
    const handler = setTimeout(() => {
        fetchAgents();
      }, 300); // Debounce search input

      return () => {
        clearTimeout(handler);
      }; // Cleanup timeout

  }, [searchQuery, currentPage, itemsPerPage]); // Re-run effect when search query, page, or itemsPerPage changes

  const handleNextPage = () => {
    // Only go to next page if the current page returned items equal to the limit
    if (agents.length === itemsPerPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(0, prevPage - 1));
  };

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading Agents...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} maxWidth="800px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Agents</Heading>

        <FormControl>
          <FormLabel>Search Agents</FormLabel>
          <Input
            type="text"
            placeholder="Search by name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FormControl>

        {agents.length === 0 && !isLoading && !error && searchQuery === "" ? (
          <Text>No agents found.</Text>
        ) : agents.length === 0 && searchQuery !== "" ? (
             <Text>No agents found matching your search.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </SimpleGrid>
        )}

        {/* Pagination Controls */}
        <HStack spacing={4} justifyContent="center" mt={4}>
          <Button
            onClick={handlePreviousPage}
            isDisabled={currentPage === 0 || isLoading}
          >
            Previous Page
          </Button>
          <Text>Page {currentPage + 1}</Text>
          <Button
            onClick={handleNextPage}
            isDisabled={agents.length < itemsPerPage || isLoading} // Disable if fewer results than limit
          >
            Next Page
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default AgentList; 