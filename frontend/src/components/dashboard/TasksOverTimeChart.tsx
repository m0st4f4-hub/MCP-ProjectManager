import React from "react";
import { Box, Heading, Text, useColorMode } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { semanticColors } from "@/tokens/colors";
import { fontSize } from "@/tokens/typography";

interface TasksOverTimeDataPoint {
  date: string;
  created: number;
  completed: number;
}

interface TasksOverTimeChartProps {
  tasksOverTime: TasksOverTimeDataPoint[];
}

const TasksOverTimeChart: React.FC<TasksOverTimeChartProps> = ({
  tasksOverTime,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define semantic colors
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

  const createdLineColor = isDark
    ? semanticColors.primary.dark
    : semanticColors.primary.DEFAULT;
  const completedLineColor = isDark
    ? semanticColors.success.dark
    : semanticColors.success.DEFAULT;

  // Color for axis/legend text - should contrast with cardBg
  const axisAndLegendColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  // Color for CartesianGrid stroke - should be subtle
  const gridStrokeColor = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;

  if (!tasksOverTime || tasksOverTime.length === 0) {
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
          Tasks Over Time (All Active Projects)
        </Heading>
        <Text color={secondaryTextColor}>
          No data available for tasks over time.
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
        Tasks Over Time (All Active Projects)
      </Heading>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={tasksOverTime}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
          <XAxis
            dataKey="date"
            fontSize={fontSize.xs}
            stroke={axisAndLegendColor}
            tick={{ fill: axisAndLegendColor }}
          />
          <YAxis
            fontSize={fontSize.xs}
            allowDecimals={false}
            stroke={axisAndLegendColor}
            tick={{ fill: axisAndLegendColor }}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: cardBg, // Use cardBg for tooltip background
              borderColor: cardBorderColor, // Use cardBorder for tooltip border
              color: headingColor, // Use headingColor for tooltip text
            }}
          />
          <Legend wrapperStyle={{ color: axisAndLegendColor }} />
          <Line
            type="monotone"
            dataKey="created"
            stroke={createdLineColor}
            name="Created"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={completedLineColor}
            name="Completed"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TasksOverTimeChart;
