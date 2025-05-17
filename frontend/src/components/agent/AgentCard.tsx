"use client";

import React from "react";
import {
  Box,
  Text,
  Badge,
  IconButton,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { Agent } from "@/types";
import { formatDisplayName } from "@/lib/utils";
import AppIcon from "../common/AppIcon";
import { CopyIcon as ChakraCopyIcon } from "@chakra-ui/icons";

export interface AgentStats {
  taskCount: number;
  projectCount: number;
  projectNames: string[];
  status: string;
  statusColorScheme: string;
}

interface AgentCardProps {
  agent: Agent;
  agentStats: AgentStats;
  onOpenEditModal: (agent: Agent) => void;
  onCopyAgentId: (id: string) => void;
  onOpenCliPrompt: (agent: Agent) => void;
  onAgentDelete: (id: string, name: string) => void;
  onCopyGetCommand?: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  agentStats,
  onOpenEditModal,
  onCopyAgentId,
  onOpenCliPrompt,
  onAgentDelete,
  onCopyGetCommand,
}) => {
  const {
    taskCount,
    projectCount,
    projectNames,
    status /* statusColorScheme */,
  } = agentStats;

  // Determine dynamic styles based on status
  let statusStyles: { bg: string; color: string } = { bg: "", color: "" };
  if (status.toLowerCase() === "active") {
    statusStyles = {
      bg: "agentStatusActiveBg",
      color: "agentStatusActiveText",
    };
  } else if (status.toLowerCase() === "idle") {
    statusStyles = {
      bg: "agentStatusIdleBg",
      color: "agentStatusIdleText",
    };
  }

  return (
    <Box
      w="full"
      p="4"
      borderWidth="xs"
      borderStyle="solid"
      borderColor="borderDecorative"
      borderRadius="md"
      bg="bgSurface"
      boxShadow="sm"
      transition="box-shadow 0.2s ease-in-out"
      _hover={{ boxShadow: "md" }}
    >
      <Flex justifyContent="space-between" alignItems="flex-start" mb="3">
        <VStack align="flex-start">
          <HStack>
            <Text fontSize="lg" fontWeight="bold" color="textPrimary">
              {formatDisplayName(agent.name)}
            </Text>
            <Badge
              fontSize="xs"
              textTransform="uppercase"
              px="2"
              py="1"
              borderRadius="sm"
              {...statusStyles}
            >
              {status}
            </Badge>
          </HStack>
          <Tooltip
            label={`Click to copy ID: ${agent.id}`}
            placement="top"
            openDelay={300}
          >
            <Text
              fontSize="sm"
              color="textSecondary"
              mt="-1"
              onClick={() => onCopyAgentId(agent.id)}
              cursor="pointer"
            >
              ID: {agent.id}
            </Text>
          </Tooltip>
        </VStack>
        <Menu closeOnSelect>
          <MenuButton
            as={IconButton}
            aria-label="Agent Options"
            icon={<AppIcon name="hamburger" />}
            variant="ghost"
            size="sm"
          />
          <MenuList
            bg="bgSurface"
            borderColor="borderDecorative"
            borderRadius="md"
            boxShadow="md"
            zIndex="dropdown"
          >
            <MenuItem
              icon={<AppIcon name="edit" mr="2" />}
              onClick={() => onOpenEditModal(agent)}
              color="textPrimary"
              fontSize="sm"
            >
              Edit Agent
            </MenuItem>
            <MenuItem
              icon={<AppIcon name="copy" mr="2" />}
              onClick={() => onCopyAgentId(agent.id)}
              color="textPrimary"
              fontSize="sm"
            >
              Copy Agent ID
            </MenuItem>
            <MenuItem
              icon={<AppIcon name="checkcircle" mr="2" />}
              onClick={() => onOpenCliPrompt(agent)}
              color="textPrimary"
              fontSize="sm"
            >
              Generate CLI Prompt
            </MenuItem>
            {onCopyGetCommand && (
              <MenuItem
                icon={<AppIcon icon={ChakraCopyIcon} mr="2" />}
                onClick={() => onCopyGetCommand(agent.id)}
                color="textPrimary"
                fontSize="sm"
              >
                Copy Get Command
              </MenuItem>
            )}
            <MenuItem
              icon={<AppIcon name="delete" mr="2" />}
              onClick={() => onAgentDelete(agent.id, agent.name)}
              color="textError"
              fontSize="sm"
              _hover={{ bg: "menuItemDestructiveHoverBg" }}
            >
              Delete Agent
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <HStack alignItems="baseline" mb="1">
        <Text fontSize="sm" color="textSecondary" fontWeight="medium">
          Tasks:
        </Text>
        <Text fontSize="sm" color="textPrimary" ml="1">
          {taskCount}
        </Text>
      </HStack>
      <HStack alignItems="baseline" mb="1">
        <Text fontSize="sm" color="textSecondary" fontWeight="medium">
          Projects:
        </Text>
        <Text fontSize="sm" color="textPrimary" ml="1">
          {projectCount > 0 ? projectCount : "N/A"}
        </Text>
      </HStack>
      {projectCount > 0 && (
        <Text fontSize="xs" color="textSecondary" mt="0.5" pl="1">
          ({projectNames.join(", ")})
        </Text>
      )}
    </Box>
  );
};

export default AgentCard;
