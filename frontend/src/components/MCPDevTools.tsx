"use client";

import React from "react";
import {
  Box,
  Heading,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from "@chakra-ui/react";
import { APITester, MemoryViewer, TaskRunner } from "./devtools";

const MCPDevTools: React.FC = () => {
  return (
    <Box p="8">
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">
          MCP Dev Tools
        </Heading>
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>API Tester</Tab>
            <Tab>Memory Viewer</Tab>
            <Tab>Task Runner</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <APITester />
            </TabPanel>
            <TabPanel>
              <MemoryViewer />
            </TabPanel>
            <TabPanel>
              <TaskRunner />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default MCPDevTools;
