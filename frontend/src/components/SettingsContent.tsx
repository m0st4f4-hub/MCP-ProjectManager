"use client";

import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore, ProjectState } from "@/store/projectStore";
import { useAgentStore, AgentState } from "@/store/agentStore";
import { semanticColors, colorPrimitives } from "@/tokens/colors";
import AppIcon from './common/AppIcon';
import { typography } from '../tokens';

const SettingsContent: React.FC = () => {
  const taskFilters = useTaskStore((state) => state.filters);
  const setTaskFilters = useTaskStore((state) => state.setFilters);

  const projectStoreFilters = useProjectStore(
    (state: ProjectState) => state.filters,
  );
  const setProjectStoreFilters = useProjectStore(
    (state: ProjectState) => state.setFilters,
  );

  const agentStoreFilters = useAgentStore((state: AgentState) => state.filters);
  const setAgentStoreFilters = useAgentStore(
    (state: AgentState) => state.setFilters,
  );

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const pageBg = isDark
    ? semanticColors.background.dark
    : semanticColors.background.DEFAULT;
  const surfaceBg = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;
  const onSurfaceColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  const textSecondaryColor = isDark
    ? semanticColors.textSecondary.dark
    : semanticColors.textSecondary.DEFAULT;
  const textPlaceholderColor = isDark
    ? semanticColors.textPlaceholder.dark
    : semanticColors.textPlaceholder.DEFAULT;
  const decorativeBorder = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;

  const switchTrackCheckedBg = isDark
    ? semanticColors.primary.dark
    : semanticColors.primary.DEFAULT;
  const switchTrackUncheckedBg = isDark
    ? colorPrimitives.gray[700]
    : colorPrimitives.gray[300];
  const switchThumbBg = isDark
    ? colorPrimitives.gray[200]
    : colorPrimitives.white;

  const handleToggleHideCompletedTasks = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTaskFilters({ hideCompleted: event.target.checked });
  };

  const handleToggleShowArchivedTasks = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTaskFilters({ is_archived: event.target.checked });
  };

  const handleToggleShowArchivedProjects = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setProjectStoreFilters({ is_archived: event.target.checked });
  };

  const handleToggleShowArchivedAgents = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAgentStoreFilters({ is_archived: event.target.checked });
  };

  const getSwitchSx = (isChecked: boolean) => ({
    "span.chakra-switch__track": {
      bg: isChecked ? switchTrackCheckedBg : switchTrackUncheckedBg,
    },
    "span.chakra-switch__thumb": {
      bg: switchThumbBg,
    },
  });

  return (
    <Box p="4" bg={pageBg}>
      <Heading
        as="h1"
        size="xl"
        fontWeight={typography.fontWeight.bold}
        color={onSurfaceColor}
        mb="6"
        display="flex"
        alignItems="center"
      >
        <AppIcon name="settings" boxSize={6} mr={2} />
        Application Settings
      </Heading>
      <VStack spacing="6" align="stretch">
        <Box
          p="4"
          borderWidth="DEFAULT"
          borderColor={decorativeBorder}
          rounded="lg"
          bg={surfaceBg}
          shadow="sm"
        >
          <Heading
            as="h2"
            size="lg"
            fontWeight={typography.fontWeight.semibold}
            color={onSurfaceColor}
            mb="4"
            display="flex"
            alignItems="center"
          >
            <AppIcon name="listordered" boxSize={5} mr={2} />
            Task Display Options
          </Heading>
          <VStack spacing="4" align="stretch">
            <FormControl
              as={Flex}
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel
                htmlFor="hide-completed-tasks"
                mb="0"
                color={textSecondaryColor}
                fontSize={typography.fontSize.md}
                lineHeight={typography.lineHeight.base}
              >
                Hide Completed Tasks
              </FormLabel>
              <Switch
                id="hide-completed-tasks"
                isChecked={taskFilters.hideCompleted || false}
                onChange={handleToggleHideCompletedTasks}
                sx={getSwitchSx(taskFilters.hideCompleted || false)}
              />
            </FormControl>
            <FormControl
              as={Flex}
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel
                htmlFor="show-archived-tasks"
                mb="0"
                color={textSecondaryColor}
                fontSize={typography.fontSize.md}
                lineHeight={typography.lineHeight.base}
              >
                Show Archived Tasks
              </FormLabel>
              <Switch
                id="show-archived-tasks"
                isChecked={taskFilters.is_archived || false}
                onChange={handleToggleShowArchivedTasks}
                sx={getSwitchSx(taskFilters.is_archived || false)}
              />
            </FormControl>
            <FormControl
              as={Flex}
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel
                htmlFor="show-archived-projects"
                mb="0"
                color={textSecondaryColor}
                fontSize={typography.fontSize.md}
                lineHeight={typography.lineHeight.base}
              >
                Show Archived Projects
              </FormLabel>
              <Switch
                id="show-archived-projects"
                isChecked={projectStoreFilters.is_archived || false}
                onChange={handleToggleShowArchivedProjects}
                sx={getSwitchSx(projectStoreFilters.is_archived || false)}
              />
            </FormControl>
            <FormControl
              as={Flex}
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel
                htmlFor="show-archived-agents"
                mb="0"
                color={textSecondaryColor}
                fontSize={typography.fontSize.md}
                lineHeight={typography.lineHeight.base}
              >
                Show Archived Agents
              </FormLabel>
              <Switch
                id="show-archived-agents"
                isChecked={agentStoreFilters.is_archived || false}
                onChange={handleToggleShowArchivedAgents}
                sx={getSwitchSx(agentStoreFilters.is_archived || false)}
              />
            </FormControl>
          </VStack>
        </Box>

        <Box
          p="4"
          borderWidth="DEFAULT"
          borderColor={decorativeBorder}
          rounded="lg"
          bg={surfaceBg}
          shadow="sm"
          opacity={0.5}
          mt="4"
        >
          <Heading
            as="h2"
            size="lg"
            fontWeight={typography.fontWeight.semibold}
            color={onSurfaceColor}
            mb="3"
            display="flex"
            alignItems="center"
          >
            <AppIcon name="database" boxSize={5} mr={2} />
            Data Management (Placeholder)
          </Heading>
          <Text color={textPlaceholderColor} mb="2">
            Settings for exporting/importing data, clearing cache, etc. will go
            here.
          </Text>
        </Box>

        <Box
          p="4"
          borderWidth="DEFAULT"
          borderColor={decorativeBorder}
          rounded="lg"
          bg={surfaceBg}
          shadow="sm"
          opacity={0.5}
          mt="4"
        >
          <Heading
            as="h2"
            size="lg"
            fontWeight={typography.fontWeight.semibold}
            color={onSurfaceColor}
            mb="3"
            display="flex"
            alignItems="center"
          >
            <AppIcon name="notifications" boxSize={5} mr={2} />
            Notifications (Placeholder)
          </Heading>
          <Text color={textPlaceholderColor} mb="2">
            Preferences for application notifications will be configured here.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default SettingsContent;
