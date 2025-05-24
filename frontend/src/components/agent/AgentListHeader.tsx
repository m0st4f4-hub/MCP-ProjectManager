"use client";

import React from "react";
import {
  Flex,
  Heading,
  Text,
  HStack,
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Button,
  useBreakpointValue,
  useToken,
} from "@chakra-ui/react";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FiUsers, FiActivity, FiClipboard } from "react-icons/fi";
// import styles from './AgentListHeader.module.css'; // Removed
import { Agent, Task, TaskStatus } from "@/types";
import AppIcon from "../common/AppIcon";

interface AgentListHeaderProps {
  agents: Agent[];
  tasks: Task[];
  onAddAgentClick: () => void;
}

const AgentListHeader: React.FC<AgentListHeaderProps> = ({
  agents,
  tasks,
  onAddAgentClick,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent) =>
    agent.status && ["busy", "available"].includes(agent.status.toLowerCase())
  ).length;
  const totalTasks = tasks.length;

  const [
    bgSurface,
    bgSurfaceElevated,
    textPrimary,
    textSecondary,
    textInverse,
    brandPrimary,
    borderDecorative,
    buttonSuccessBg,
    buttonSuccessBgHover,
  ] = useToken("colors", [
    "bgSurface",
    "bgSurfaceElevated",
    "textPrimary",
    "textSecondary",
    "textInverse",
    "brandPrimary",
    "borderDecorative",
    "buttonSuccessBg",
    "buttonSuccessBgHover",
  ]);

  return (
    <Flex
      w="100%"
      justifyContent="space-between"
      alignItems="center"
      mb="spacing.6"
      p="spacing.4"
      bg={bgSurfaceElevated}
      borderRadius="radii.md"
      boxShadow="shadows.sm"
    >
      <Heading
        fontSize="typography.fontSizes.h3"
        fontWeight="typography.fontWeights.bold"
        color={textPrimary}
        mr="spacing.4"
      >
        Registry
      </Heading>
      <HStack spacing={6} flexGrow={1} justifyContent="flex-start">
        <HStack>
          <Icon
            as={FiUsers}
            fontSize="typography.fontSizes.xl"
            color={brandPrimary}
            mr="spacing.1"
          />
          <Box>
            <Text
              fontSize="typography.fontSizes.lg"
              fontWeight="typography.fontWeights.bold"
              color={textPrimary}
              lineHeight="typography.lineHeights.condensed"
            >
              {totalAgents}
            </Text>
            <Text
              fontSize="typography.fontSizes.xs"
              color={textSecondary}
              textTransform="uppercase"
            >
              Total Agents
            </Text>
          </Box>
        </HStack>
        <HStack>
          <Icon
            as={FiActivity}
            fontSize="typography.fontSizes.xl"
            color={brandPrimary}
            mr="spacing.1"
          />
          <Box>
            <Text
              fontSize="typography.fontSizes.lg"
              fontWeight="typography.fontWeights.bold"
              color={textPrimary}
              lineHeight="typography.lineHeights.condensed"
            >
              {activeAgents}
            </Text>
            <Text
              fontSize="typography.fontSizes.xs"
              color={textSecondary}
              textTransform="uppercase"
            >
              Active Agents
            </Text>
          </Box>
        </HStack>
        <HStack>
          <Icon
            as={FiClipboard}
            fontSize="typography.fontSizes.xl"
            color={brandPrimary}
            mr="spacing.1"
          />
          <Box>
            <Text
              fontSize="typography.fontSizes.lg"
              fontWeight="typography.fontWeights.bold"
              color={textPrimary}
              lineHeight="typography.lineHeights.condensed"
            >
              {totalTasks}
            </Text>
            <Text
              fontSize="typography.fontSizes.xs"
              color={textSecondary}
              textTransform="uppercase"
            >
              Total Tasks
            </Text>
          </Box>
        </HStack>
      </HStack>
      {isMobile ? (
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Agent Actions"
            icon={<HamburgerIcon />}
            bg="transparent"
            borderWidth="borders.width.xs"
            borderStyle="solid"
            borderColor={borderDecorative}
            _hover={{ bg: "colors.bgInteractiveSubtleHover" }}
            _active={{ bg: "colors.bgInteractiveSubtleActive" }}
          />
          <MenuList
            bg={bgSurface}
            borderWidth="borders.width.xs"
            borderColor={borderDecorative}
            borderRadius="radii.md"
            boxShadow="shadows.md"
            zIndex="zIndices.dropdown"
            minW="auto"
          >
            <MenuItem
              icon={<AddIcon mr="spacing.2" />}
              onClick={onAddAgentClick}
              color={textPrimary}
              fontSize="typography.fontSizes.sm"
              px="spacing.3"
              py="spacing.2"
              _hover={{ bg: "colors.bgInteractiveSubtleHover" }}
            >
              Register Agent
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Button
          leftIcon={<AppIcon name="add" />}
          onClick={onAddAgentClick}
          bg={buttonSuccessBg}
          color={textInverse}
          size="sm"
          _hover={{ bg: buttonSuccessBgHover }}
          _active={{ bg: buttonSuccessBgHover }} // Can refine active state if needed
        >
          Register Agent
        </Button>
      )}
    </Flex>
  );
};

export default AgentListHeader;
