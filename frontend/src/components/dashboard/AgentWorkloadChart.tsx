"use client"; // Added 'use client' as it's a client component

import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LabelList,
  Cell,
} from "recharts";
import AppIcon from "../common/AppIcon";
import { sizing, shadows, typography } from "../../tokens";

interface AgentWorkloadDataPoint {
  name: string;
  tasks: number;
  color: string;
}

interface AgentWorkloadChartProps {
  agentWorkload: AgentWorkloadDataPoint[];
}

const AgentWorkloadChart: React.FC<AgentWorkloadChartProps> = ({
  agentWorkload,
}) => {
  if (!agentWorkload || agentWorkload.length === 0) {
    return (
      <Box
        p={sizing.spacing[4]}
        bg="bgSurface"
        borderRadius={sizing.borderRadius.lg}
        boxShadow={shadows.md}
        borderWidth={sizing.borderWidth.DEFAULT || "1px"}
        borderStyle="solid"
        borderColor="borderDecorative"
        minH={sizing.height.xl}
      >
        <Heading
          as="h3"
          fontSize={typography.fontSize.h4}
          fontWeight={typography.fontWeight.semibold}
          lineHeight={typography.lineHeight.condensed}
          mb={sizing.spacing[4]}
          color="textPrimary"
          display="flex"
          alignItems="center"
        >
          <AppIcon name="users" boxSize={5} mr={2} />
          Agent Workload (Tasks Assigned)
        </Heading>
        <Text color="textSecondary">No data available for agent workload.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={sizing.spacing[4]}
      bg="bgSurface"
      borderRadius={sizing.borderRadius.lg}
      boxShadow={shadows.md}
      borderWidth={sizing.borderWidth.DEFAULT || "1px"}
      borderStyle="solid"
      borderColor="borderDecorative"
      minH={sizing.height.xl}
    >
      <Heading
        as="h3"
        fontSize={typography.fontSize.h4}
        fontWeight={typography.fontWeight.semibold}
        lineHeight={typography.lineHeight.condensed}
        mb={sizing.spacing[4]}
        color="textPrimary"
        display="flex"
        alignItems="center"
      >
        <AppIcon name="users" boxSize={5} mr={2} />
        Agent Workload (Tasks Assigned)
      </Heading>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={agentWorkload}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={typography.fontSize.sm} />
          <YAxis fontSize={typography.fontSize.sm} allowDecimals={false} />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="tasks" name="Assigned Tasks" isAnimationActive>
            {agentWorkload.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey="tasks"
              position="top"
              fontSize={typography.fontSize.sm}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AgentWorkloadChart;
