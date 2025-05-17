import React from "react";
import { Box, Heading, Text, useColorMode } from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LabelList,
} from "recharts";
import { semanticColors } from "@/tokens/colors";
import { fontSize } from "@/tokens/typography";

interface StatusCountItem {
  name: string;
  value: number;
  color: string;
}

interface TaskStatusChartProps {
  statusCounts: StatusCountItem[];
}

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ statusCounts }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const cardBg = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;
  const cardBorderColor = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;
  const headingColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  const secondaryTextColor = isDark
    ? semanticColors.textSecondary.dark
    : semanticColors.textSecondary.DEFAULT;

  const outerLabelColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  const innerLabelColor = isDark
    ? semanticColors.onPrimary.dark
    : semanticColors.onPrimary.DEFAULT;

  if (!statusCounts || statusCounts.length === 0) {
    return (
      <Box
        p={4}
        bg={cardBg}
        borderRadius="lg"
        shadow="md"
        borderWidth="DEFAULT"
        borderColor={cardBorderColor}
        minH="340px"
      >
        <Heading size="sm" mb={4} color={headingColor}>
          Tasks per Status (All Active Projects)
        </Heading>
        <Text color={secondaryTextColor}>
          No data available for task statuses.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      bg={cardBg}
      borderRadius="lg"
      shadow="md"
      borderWidth="DEFAULT"
      borderColor={cardBorderColor}
      minH="340px"
    >
      <Heading size="sm" mb={4} color={headingColor}>
        Tasks per Status (All Active Projects)
      </Heading>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={statusCounts}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            dataKey="value"
            isAnimationActive
          >
            {statusCounts.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey="name"
              position="outside"
              fill={outerLabelColor}
              fontSize={fontSize.xs}
            />
            <LabelList
              dataKey="value"
              position="inside"
              fill={innerLabelColor}
              fontSize={fontSize.sm}
              fontWeight="bold"
            />
          </Pie>
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TaskStatusChart;
