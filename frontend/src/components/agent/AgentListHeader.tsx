'use client';

import React from 'react';
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
} from '@chakra-ui/react';
import { AddIcon, HamburgerIcon } from '@chakra-ui/icons';
import { FiUsers, FiActivity, FiClipboard } from 'react-icons/fi';
import styles from './AgentListHeader.module.css';
import { Agent, Task, TaskStatus } from '@/types';

interface AgentListHeaderProps {
    agents: Agent[];
    tasks: Task[];
    onAddAgentClick: () => void;
}

const AgentListHeader: React.FC<AgentListHeaderProps> = ({ agents, tasks, onAddAgentClick }) => {
    const isMobile = useBreakpointValue({ base: true, md: false });

    const totalAgents = agents.length;
    const activeAgents = agents.filter(agent => 
        tasks.some(task => task.agent_id === agent.id && task.status !== TaskStatus.COMPLETED)
    ).length;
    const totalTasks = tasks.length;

    return (
        <Flex className={styles.headerFlex}>
            <Heading className={styles.registryHeading}>Registry</Heading>
            <HStack spacing={6} className={styles.statsContainer}>
                <HStack>
                    <Icon as={FiUsers} className={styles.statIcon} />
                    <Box>
                        <Text className={styles.statValue}>{totalAgents}</Text>
                        <Text className={styles.statLabel}>Total Agents</Text>
                    </Box>
                </HStack>
                <HStack>
                    <Icon as={FiActivity} className={styles.statIcon} />
                    <Box>
                        <Text className={styles.statValue}>{activeAgents}</Text>
                        <Text className={styles.statLabel}>Active Agents</Text>
                    </Box>
                </HStack>
                <HStack>
                    <Icon as={FiClipboard} className={styles.statIcon} />
                    <Box>
                        <Text className={styles.statValue}>{totalTasks}</Text>
                        <Text className={styles.statLabel}>Total Tasks</Text>
                    </Box>
                </HStack>
            </HStack>
            {isMobile ? (
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label='Agent Actions'
                        icon={<HamburgerIcon />}
                        className={styles.mobileMenuButton}
                    />
                    <MenuList className={styles.menuList}>
                        <MenuItem
                            icon={<AddIcon className={styles.menuItemIcon} />}
                            onClick={onAddAgentClick}
                            className={styles.menuItem}
                        >
                            Register Agent
                        </MenuItem>
                    </MenuList>
                </Menu>
            ) : (
                <Button
                    leftIcon={<AddIcon />}
                    onClick={onAddAgentClick}
                    className={styles.registerAgentButton}
                    size="sm"
                >
                    Register Agent
                </Button>
            )}
        </Flex>
    );
};

export default AgentListHeader; 