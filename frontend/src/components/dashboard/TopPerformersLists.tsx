import React from "react";
import {
  Badge,
  Box,
  Grid,
  Heading,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import AppIcon from "../common/AppIcon";
import { sizing, typography, shadows } from "../../tokens";

interface PerformerItem {
  name: string;
  value: number; // tasks count
}

interface TopPerformersListsProps {
  topAgents: PerformerItem[];
  topProjects: PerformerItem[];
}

const TopPerformersLists: React.FC<TopPerformersListsProps> = ({
  topAgents,
  topProjects,
}) => {
  return (
    <Grid
      gap={sizing.spacing[8]}
      templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
    >
      <Box
        p={sizing.spacing[4]}
        bg="surface"
        borderRadius={sizing.borderRadius.lg}
        boxShadow={shadows.md}
        borderWidth={sizing.borderWidth.DEFAULT}
        borderStyle="solid"
        borderColor="borderDecorative"
        minHeight="13.75rem"
      >
        <Heading
          as="h3"
          fontSize={typography.fontSize.md}
          fontWeight={typography.fontWeight.semibold}
          lineHeight={typography.lineHeight.condensed}
          mb={sizing.spacing[4]}
          color="textPrimary"
          display="flex"
          alignItems="center"
        >
          <AppIcon name="star" boxSize={5} mr={2} />
          Top 3 Busiest Agents (All Active Projects)
        </Heading>
        <List spacing={sizing.spacing[2]}>
          {topAgents.length === 0 ? (
            <ListItem>
              <Text color="textSecondary">
                No agent data for this selection.
              </Text>
            </ListItem>
          ) : (
            topAgents.map((agent) => (
              <ListItem key={agent.name} display="flex" alignItems="center">
                <AppIcon name="trophy" boxSize={4} mr={2} />
                <Text fontWeight={typography.fontWeight.bold}>
                  {agent.name}
                </Text>
                <Badge colorScheme="purple">{agent.value} tasks</Badge>
              </ListItem>
            ))
          )}
        </List>
      </Box>
      <Box
        p={sizing.spacing[4]}
        bg="surface"
        borderRadius={sizing.borderRadius.lg}
        boxShadow={shadows.md}
        borderWidth={sizing.borderWidth.DEFAULT}
        borderStyle="solid"
        borderColor="borderDecorative"
        minHeight="13.75rem"
      >
        <Heading
          as="h3"
          fontSize={typography.fontSize.md}
          fontWeight={typography.fontWeight.semibold}
          lineHeight={typography.lineHeight.condensed}
          mb={sizing.spacing[4]}
          color="textPrimary"
          display="flex"
          alignItems="center"
        >
          <AppIcon name="star" boxSize={5} mr={2} />
          Top 3 Projects by Workload (All Active Projects)
        </Heading>
        <List spacing={sizing.spacing[2]}>
          {topProjects.length === 0 ? (
            <ListItem>
              <Text color="textSecondary">
                No project data for this selection.
              </Text>
            </ListItem>
          ) : (
            topProjects.map((project) => (
              <ListItem key={project.name} display="flex" alignItems="center">
                <AppIcon name="trophy" boxSize={4} mr={2} />
                <Text fontWeight={typography.fontWeight.bold}>
                  {project.name}
                </Text>
                <Badge colorScheme="blue">{project.value} tasks</Badge>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Grid>
  );
};

export default TopPerformersLists;
