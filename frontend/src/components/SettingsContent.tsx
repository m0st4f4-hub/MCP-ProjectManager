'use client';

import React from 'react';
import {
    // Box,
    // Heading,
    // Text,
    // VStack,
    Switch,
    // FormControl,
    // FormLabel,
    // useColorMode,
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore, ProjectState } from '@/store/projectStore';
import { useAgentStore, AgentState } from '@/store/agentStore';
import styles from './SettingsContent.module.css';
import { clsx } from 'clsx';

const SettingsContent: React.FC = () => {
    const taskFilters = useTaskStore(state => state.filters);
    const setTaskFilters = useTaskStore(state => state.setFilters);

    const projectStoreFilters = useProjectStore((state: ProjectState) => state.filters);
    const setProjectStoreFilters = useProjectStore((state: ProjectState) => state.setFilters);

    const agentStoreFilters = useAgentStore((state: AgentState) => state.filters);
    const setAgentStoreFilters = useAgentStore((state: AgentState) => state.setFilters);

    const handleToggleHideCompletedTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTaskFilters({ hideCompleted: event.target.checked });
    };

    const handleToggleShowArchivedTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTaskFilters({ is_archived: event.target.checked });
    };

    const handleToggleShowArchivedProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectStoreFilters({ is_archived: event.target.checked });
    };

    const handleToggleShowArchivedAgents = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAgentStoreFilters({ is_archived: event.target.checked });
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.mainHeading}>Application Settings</h1>
            <div className={styles.settingsListContainer}>
                <div className={styles.settingsSectionBox}>
                    <h2 className={styles.sectionHeading}>Task Display Options</h2>
                    <div className={styles.optionsVStack}>
                        <div className={styles.formControlFlex}>
                            <label htmlFor="hide-completed-tasks" className={styles.formLabel}>
                                Hide Completed Tasks
                            </label>
                            <Switch
                                id="hide-completed-tasks"
                                isChecked={taskFilters.hideCompleted || false}
                                onChange={handleToggleHideCompletedTasks}
                                colorScheme="brand"
                                sx={{
                                    "span.chakra-switch__track": {
                                        bg: taskFilters.hideCompleted ? "brand.500" : "gray.300",
                                        _dark: {
                                            bg: taskFilters.hideCompleted ? "brand.300" : "gray.500",
                                        }
                                    },
                                    "span.chakra-switch__thumb": {
                                        bg: "white",
                                        _dark: {
                                            bg: "gray.50",
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.formControlFlex}>
                            <label htmlFor="show-archived-tasks" className={styles.formLabel}>
                                Show Archived Tasks
                            </label>
                            <Switch
                                id="show-archived-tasks"
                                isChecked={taskFilters.is_archived || false}
                                onChange={handleToggleShowArchivedTasks}
                                colorScheme="brand"
                                sx={{
                                    "span.chakra-switch__track": {
                                        bg: taskFilters.is_archived ? "brand.500" : "gray.300",
                                        _dark: {
                                            bg: taskFilters.is_archived ? "brand.300" : "gray.500",
                                        }
                                    },
                                    "span.chakra-switch__thumb": {
                                        bg: "white",
                                        _dark: {
                                            bg: "gray.50",
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.formControlFlex}>
                            <label htmlFor="show-archived-projects" className={styles.formLabel}>
                                Show Archived Projects
                            </label>
                            <Switch
                                id="show-archived-projects"
                                isChecked={projectStoreFilters.is_archived || false}
                                onChange={handleToggleShowArchivedProjects}
                                colorScheme="brand"
                                sx={{
                                    "span.chakra-switch__track": {
                                        bg: projectStoreFilters.is_archived ? "brand.500" : "gray.300",
                                        _dark: {
                                            bg: projectStoreFilters.is_archived ? "brand.300" : "gray.500",
                                        }
                                    },
                                    "span.chakra-switch__thumb": {
                                        bg: "white",
                                        _dark: {
                                            bg: "gray.50",
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.formControlFlex}>
                            <label htmlFor="show-archived-agents" className={styles.formLabel}>
                                Show Archived Agents
                            </label>
                            <Switch
                                id="show-archived-agents"
                                isChecked={agentStoreFilters.is_archived || false}
                                onChange={handleToggleShowArchivedAgents}
                                colorScheme="brand"
                                sx={{
                                    "span.chakra-switch__track": {
                                        bg: agentStoreFilters.is_archived ? "brand.500" : "gray.300",
                                        _dark: {
                                            bg: agentStoreFilters.is_archived ? "brand.300" : "gray.500",
                                        }
                                    },
                                    "span.chakra-switch__thumb": {
                                        bg: "white",
                                        _dark: {
                                            bg: "gray.50",
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className={clsx(styles.settingsSectionBox, styles.opacityHalf, styles.marginTop4)}>
                    <h2 className={styles.sectionHeadingMb3}>Data Management (Placeholder)</h2>
                    <p className={styles.placeholderText}>Settings for exporting/importing data, clearing cache, etc. will go here.</p>
                </div>

                <div className={clsx(styles.settingsSectionBox, styles.opacityHalf, styles.marginTop4)}>
                    <h2 className={styles.sectionHeadingMb3}>Notifications (Placeholder)</h2>
                    <p className={styles.placeholderText}>Preferences for application notifications will be configured here.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsContent; 