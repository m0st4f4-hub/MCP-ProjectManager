"use client"; // Added 'use client' as it's a client component

import React from "react";
import {
  Progress,
  Box, // Added
  Heading, // Added
  Text, // Added
  VStack, // Added
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
// import styles from './ProjectProgressChart.module.css'; // To be removed

interface ProjectProgressDataPoint {
  name: string;
  value: number; // Number of tasks
  color: string;
  progress: number; // Percentage completion
}

interface ProjectProgressChartProps {
  tasksPerProject: ProjectProgressDataPoint[];
}

const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({
  tasksPerProject,
}) => {
  if (!tasksPerProject || tasksPerProject.length === 0) {
    return (
      <Box
        // className={styles.container} // Removed
        p="4"
        bg="bgSurface"
        borderRadius="lg"
        shadow="md"
        borderWidth="xs"
        borderStyle="solid"
        borderColor="borderDecorative"
        minH="21.25rem"
      >
        <Heading
          as="h3"
          // className={styles.heading} // Removed
          size="md"
          fontWeight="semibold"
          lineHeight="condensed"
          mb="4"
          color="textPrimary"
        >
          Project Progress (All Active Projects)
        </Heading>
        <Text /* className={styles.noDataText} */ color="textSecondary">
          No data available for project progress.
        </Text>
      </Box>
    );
  }
  return (
    <Box
      // className={styles.container} // Removed
      p="4"
      bg="bgSurface"
      borderRadius="lg"
      shadow="md"
      borderWidth="xs"
      borderStyle="solid"
      borderColor="borderDecorative"
      minH="21.25rem"
    >
      <Heading
        as="h3"
        // className={styles.heading} // Removed
        size="md"
        fontWeight="semibold"
        lineHeight="condensed"
        mb="4"
        color="textPrimary"
      >
        Project Progress (All Active Projects)
      </Heading>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={tasksPerProject}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" fontSize={12} allowDecimals={false} />
          <YAxis dataKey="name" type="category" fontSize={12} width={120} />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="value" name="Tasks" isAnimationActive>
            {tasksPerProject.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="right" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <VStack
        // className={styles.progressSection} // Removed
        align="stretch"
        mt="4"
        spacing="2"
      >
        {tasksPerProject.slice(0, 5).map((project) => (
          <Box
            key={
              project.name
            } /* className={styles.progressItemContainer} - no styles */
          >
            <Text
              // className={styles.progressLabel} // Removed
              fontSize="xs"
              color="textSecondary"
              mb="1"
            >
              {project.name} Progress
            </Text>
            <Progress
              value={project.progress}
              size="sm"
              colorScheme="green"
              borderRadius="full"
            />
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ProjectProgressChart;
