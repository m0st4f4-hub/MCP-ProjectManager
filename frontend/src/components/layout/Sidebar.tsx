"use client";
import React from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  IconButton,
  Image,
  useColorMode,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { ThemeToggleButton } from "../ThemeToggleButton";

interface NavItem {
  view: string;
  label: string;
  icon: JSX.Element;
}

interface ActionNavItem {
  id: string;
  label: string;
  icon: JSX.Element;
  action: () => void;
  showInView?: string[];
}

interface UtilityNavItem {
  id: string;
  label: string;
  icon: JSX.Element;
  action: () => void;
}

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (
    isCollapsed: boolean | ((prevState: boolean) => boolean),
  ) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  navItems: NavItem[];
  actionNavItems: ActionNavItem[];
  utilityNavItems: UtilityNavItem[];
  // Removed modal-specific action props, they will be called from page.tsx via item.action directly
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeView,
  setActiveView,
  navItems,
  actionNavItems,
  utilityNavItems,
}) => {
  const { colorMode } = useColorMode(); // colorMode is used for logo path

  return (
    <Flex
      direction="column"
      bg="surface" // Changed from bg-sidebar
      color="onSurface" // Changed from text.sidebar.primary
      transition="width 0.2s ease-in-out"
      borderRight="1px solid"
      borderColor="borderDecorative" // Changed from border.primary
      pt="4"
      pb="4"
      w={isSidebarCollapsed ? "sidebarCollapsed" : "sidebarExpanded"} // Use named width tokens
      px={isSidebarCollapsed ? "2" : "4"}
    >
      {/* Logo at the top */}
      <Box display="flex" flexDirection="column" alignItems="center" mb="4">
        {isSidebarCollapsed ? (
          <Image
            src={
              colorMode === "dark"
                ? "/assets/images/icon_dark.png"
                : "/assets/images/icon_light.png"
            }
            alt="Project Manager Icon"
            boxSize="36"
            objectFit="contain"
            mb="2"
          />
        ) : (
          <Image
            src={
              colorMode === "dark"
                ? "/assets/images/logo_dark.png"
                : "/assets/images/logo_light.png"
            }
            alt="Project Manager Logo"
            h="90"
            w="auto"
            objectFit="contain"
            mb="2"
          />
        )}
        {/* Theme toggler and sidebar arrow below logo, in a styled block */}
        <Box
          display="flex"
          flexDirection={isSidebarCollapsed ? "column" : "row"}
          alignItems="center"
          justifyContent="center"
          bg={isSidebarCollapsed ? "transparent" : "surfaceElevated"} // Changed from bg.sidebar.block
          borderRadius="lg"
          boxShadow={isSidebarCollapsed ? undefined : "sm"}
          p={isSidebarCollapsed ? 0 : 2}
          gap={isSidebarCollapsed ? 2 : 3}
          mb={2}
          width={isSidebarCollapsed ? "auto" : "100%"}
        >
          <ThemeToggleButton />
          <IconButton
            aria-label={
              isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
            }
            icon={
              isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />
            }
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            variant="ghost"
            size={isSidebarCollapsed ? "lg" : "md"}
            mt={isSidebarCollapsed ? 2 : 0}
          />
        </Box>
      </Box>

      <VStack as="nav" spacing="1" align="stretch">
        {navItems.map((item) => (
          <Tooltip
            label={item.label}
            isDisabled={!isSidebarCollapsed}
            placement="right"
            key={item.view}
          >
            <Button
              onClick={() => setActiveView(item.view)}
              variant={activeView === item.view ? "solid" : "ghost"}
              colorScheme={activeView === item.view ? "blue" : "gray"}
              justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
              px={isSidebarCollapsed ? "0" : "4"}
              h="10"
              bg={activeView === item.view ? "menuItemActive" : "transparent"}
              color={activeView === item.view ? "onMenuItemActive" : "inherit"}
              _hover={{
                bg:
                  activeView === item.view
                    ? "menuItemActive"
                    : "surfaceElevated", // Explicitly use surfaceElevated for hover
                color:
                  activeView === item.view ? "onMenuItemActive" : "inherit",
              }}
            >
              <Box mr={isSidebarCollapsed ? "0" : "3"}>{item.icon}</Box>
              {!isSidebarCollapsed && <Text fontSize="sm\">{item.label}</Text>}
            </Button>
          </Tooltip>
        ))}
      </VStack>

      <VStack mt="auto" spacing="1" align="stretch">
        {actionNavItems
          .filter(
            (item) => !item.showInView || item.showInView.includes(activeView),
          )
          .map((item) => (
            <Tooltip
              label={item.label}
              isDisabled={!isSidebarCollapsed}
              placement="right"
              key={item.id}
            >
              <Button
                onClick={item.action} // Actions like onAddTaskOpen are passed directly
                variant="ghost"
                justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
                px={isSidebarCollapsed ? "0" : "4"}
                h="10"
                _hover={{ bg: "surfaceElevated" }} // Changed from bg.sidebar.hover, using surfaceElevated for consistency
              >
                <Box mr={isSidebarCollapsed ? "0" : "3"}>{item.icon}</Box>
                {!isSidebarCollapsed && (
                  <Text fontSize="sm\">{item.label}</Text>
                )}
              </Button>
            </Tooltip>
          ))}
      </VStack>

      <VStack mt="4" spacing="1" align="stretch">
        {utilityNavItems.map((item) => (
          <Tooltip
            label={item.label}
            isDisabled={!isSidebarCollapsed}
            placement="right"
            key={item.id}
          >
            <Button
              onClick={item.action} // Actions like setActiveView or onOpenDevTools
              variant={activeView === item.label ? "solid" : "ghost"} // Assuming item.label is key for active state for settings
              colorScheme={activeView === item.label ? "blue" : "gray"}
              justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
              px={isSidebarCollapsed ? "0" : "4"}
              h="10"
              bg={
                activeView === item.label // Check if item.label is the right key for 'Settings' active state
                  ? "menuItemActive"
                  : "transparent"
              }
              color={activeView === item.label ? "onMenuItemActive" : "inherit"}
              _hover={{
                bg:
                  activeView === item.label
                    ? "menuItemActive"
                    : "surfaceElevated",
                color:
                  activeView === item.label ? "onMenuItemActive" : "inherit",
              }}
            >
              <Box mr={isSidebarCollapsed ? "0" : "3"}>{item.icon}</Box>
              {!isSidebarCollapsed && <Text fontSize="sm\">{item.label}</Text>}
            </Button>
          </Tooltip>
        ))}
      </VStack>
    </Flex>
  );
};

export default Sidebar;
