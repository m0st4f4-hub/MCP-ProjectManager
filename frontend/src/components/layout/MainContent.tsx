import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

interface MainContentProps {
  isSidebarCollapsed: boolean;
  activeView: string;
  renderContent: () => JSX.Element | null;
  isDrawerOpen: boolean; // For mobile drawer state
  onDrawerOpen: () => void; // To open mobile drawer
}

const MainContent: React.FC<MainContentProps> = ({
  isSidebarCollapsed,
  activeView,
  renderContent,
  isDrawerOpen,
  onDrawerOpen,
}) => {
  return (
    <Box
      flexGrow={1}
      p="6"
      bg="background" // Changed from bg.content
      overflowY="auto"
      transition="margin-left 0.2s ease-in-out"
      ml={isSidebarCollapsed ? "sidebarCollapsed" : "sidebarExpanded"} // Use named width tokens
    >
      <Flex
        as="header"
        display={{ base: "flex", md: "flex" }}
        alignItems="center"
        justifyContent="space-between"
        mb="6"
      >
        <IconButton
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
          aria-controls="navigation-drawer" // Assuming a drawer for mobile nav might be added here or in parent
          icon={<HamburgerIcon />}
          onClick={onDrawerOpen}
          variant="ghost"
          display={{ base: "flex", md: "none" }} // Show only on mobile
        />
        <Box
          flexGrow={{ base: 1, md: "initial" }}
          textAlign={{ base: "center", md: "left" }}
        >
          <Heading as="h1" size="lg" color="textPrimary">
            {activeView}
          </Heading>
        </Box>
        <Box display={{ base: "none", md: "flex" }}>
          {/* Header controls for larger screens, if any */}
        </Box>
      </Flex>
      <Box as="main">{renderContent()}</Box>
    </Box>
  );
};

export default MainContent; 