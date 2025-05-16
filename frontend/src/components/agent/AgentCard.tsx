'use client';

import React from 'react';
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
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, CopyIcon, CheckCircleIcon, EditIcon } from '@chakra-ui/icons';
import { Agent } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import styles from './AgentCard.module.css'; // To be created

export interface AgentStats {
    taskCount: number;
    projectCount: number;
    projectNames: string[];
    status: string;
    statusColorScheme: string;
    statusClassName: string; // For dynamic class based on status
}

interface AgentCardProps {
    agent: Agent;
    agentStats: AgentStats;
    onOpenEditModal: (agent: Agent) => void;
    onCopyAgentId: (id: string) => void;
    onOpenCliPrompt: (agent: Agent) => void;
    onAgentDelete: (id: string, name: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
    agent, 
    agentStats, 
    onOpenEditModal, 
    onCopyAgentId, 
    onOpenCliPrompt, 
    onAgentDelete 
}) => {
    const { taskCount, projectCount, projectNames, status, statusColorScheme, statusClassName } = agentStats;

    return (
        <Box className={styles.agentCard}>
            <Flex className={styles.agentCardHeader}>
                <VStack className={styles.agentInfoVStack}>
                    <HStack>
                        <Text className={styles.agentName}>
                            {formatDisplayName(agent.name)}
                        </Text>
                        <Badge 
                            className={`${styles.agentStatusBadge} ${statusClassName}`}
                            colorScheme={statusColorScheme}
                        >
                            {status} 
                        </Badge>
                    </HStack>
                    <Tooltip label={`Click to copy ID: ${agent.id}`} placement="top" openDelay={300}>
                        <Text 
                            className={styles.agentId} 
                            onClick={() => onCopyAgentId(agent.id)} 
                            cursor="pointer"
                        >
                            ID: {agent.id}
                        </Text>
                    </Tooltip>
                </VStack>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label='Agent Options'
                        icon={<HamburgerIcon />}
                        className={styles.agentActionsMenuButton}
                    />
                    <MenuList className={styles.menuList}>
                        <MenuItem 
                            icon={<EditIcon className={styles.menuItemIcon} />}
                            onClick={() => onOpenEditModal(agent)}
                            className={styles.menuItem}
                        >
                            Edit Agent
                        </MenuItem>
                        <MenuItem 
                            icon={<CopyIcon className={styles.menuItemIcon} />}
                            onClick={() => onCopyAgentId(agent.id)}
                            className={styles.menuItem}
                        >
                            Copy Agent ID
                        </MenuItem>
                        <MenuItem 
                            icon={<CheckCircleIcon className={styles.menuItemIcon} />}
                            onClick={() => onOpenCliPrompt(agent)}
                            className={styles.menuItem}
                        >
                            Generate CLI Prompt
                        </MenuItem>
                        <MenuItem 
                            icon={<DeleteIcon className={styles.menuItemIcon} />}
                            onClick={() => onAgentDelete(agent.id, agent.name)}
                            className={`${styles.menuItem} ${styles.menuItemDestructive}`}
                        >
                            Delete Agent
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
            
            <HStack className={styles.agentStatsLabels}>
                <Text className={styles.statLabel}>Tasks:</Text>
                <Text className={styles.statValue}>{taskCount}</Text>
            </HStack>
            <HStack className={styles.agentStatsLabels}>
                <Text className={styles.statLabel}>Projects:</Text>
                <Text className={styles.statValue}>{projectCount > 0 ? projectCount : 'N/A'}</Text>
            </HStack>
            {projectCount > 0 && (
                <Text className={styles.projectNamesList}>
                    ({projectNames.join(', ')})
                </Text>
            )}
        </Box>
    );
};

export default AgentCard; 