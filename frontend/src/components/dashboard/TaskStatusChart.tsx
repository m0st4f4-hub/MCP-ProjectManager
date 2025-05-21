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

// Exported for reuse elsewhere if needed
export interface StatusCountItem {
  name: string;
  value: number;
  color: string;
}

export interface TaskStatusChartProps {
  statusCounts: StatusCountItem[];
  minHeight?: string | number;
  chartHeight?: number | string;
}

// Helper to DRY up color selection
function themedColor(light: string, dark: string, isDark: boolean) {
  return isDark ? dark : light;
}

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({
  statusCounts,
  minHeight = "340px",
  chartHeight = 260,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const cardBg = themedColor(
    semanticColors.surface.DEFAULT,
    semanticColors.surface.dark,
    isDark,
  );
  const cardBorderColor = themedColor(
    semanticColors.borderDecorative.DEFAULT,
    semanticColors.borderDecorative.dark,
    isDark,
  );
  const headingColor = themedColor(
    semanticColors.onSurface.DEFAULT,
    semanticColors.onSurface.dark,
    isDark,
  );
  const secondaryTextColor = themedColor(
    semanticColors.textSecondary.DEFAULT,
    semanticColors.textSecondary.dark,
    isDark,
  );
  const outerLabelColor = themedColor(
    semanticColors.onSurface.DEFAULT,
    semanticColors.onSurface.dark,
    isDark,
  );
  const innerLabelColor = themedColor(
    semanticColors.onPrimary.DEFAULT,
    semanticColors.onPrimary.dark,
    isDark,
  );

  if (!statusCounts || statusCounts.length === 0) {
    return (
      <Box
        p={4}
        bg={cardBg}
        borderRadius="lg"
        shadow="md"
        borderWidth="DEFAULT"
        borderColor={cardBorderColor}
        minH={minHeight}
        aria-label="Task status chart card"
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
      minH={minHeight}
      aria-label="Task status chart card"
    >
      <Heading size="sm" mb={4} color={headingColor}>
        Tasks per Status (All Active Projects)
      </Heading>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart role="img" aria-label="Pie chart of tasks per status">
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
