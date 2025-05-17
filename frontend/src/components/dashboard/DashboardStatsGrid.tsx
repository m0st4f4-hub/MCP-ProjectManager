"use client";

import React from "react";
import {
  SimpleGrid,
  Box,
  Skeleton,
  Flex,
  VStack,
  Text,
  IconButton,
  useClipboard,
  useToast,
  Tooltip,
  BoxProps,
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiCopy } from "react-icons/fi";
import AppIcon from "../common/AppIcon";

interface StatCardData {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ElementType;
  iconColor?: string;
  onClick?: () => void;
  isLoading?: boolean;
  isCopyable?: boolean;
}

interface DashboardStatsGridProps {
  stats: StatCardData[];
  isLoading?: boolean;
  columns?:
    | number
    | number[]
    | Partial<Record<"base" | "sm" | "md" | "lg" | "xl", number>>;
}

const StatCard: React.FC<StatCardData> = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon: StatIcon,
  iconColor = "iconDefault",
  onClick,
  isCopyable,
}) => {
  const { hasCopied, onCopy } = useClipboard(
    typeof value === "number" ? String(value) : value,
  );
  const toast = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy();
    toast({
      title: "Copied to clipboard!",
      status: "success",
      duration: 1500,
      isClosable: true,
    });
  };

  const cardStyles: BoxProps = {
    p: "6",
    boxShadow: "lg",
    borderWidth: "xs",
    borderStyle: "solid",
    borderRadius: "xl",
    bg: "bgSurface",
    borderColor: "borderDecorative",
    transition: "all 0.2s",
    minH: "30",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  };

  const clickableStyles = onClick
    ? {
        _hover: {
          boxShadow: "2xl",
          transform: "translateY(-2px)",
          borderColor: "brandPrimaryActive",
          cursor: "pointer",
        },
        role: "button",
        tabIndex: 0,
      }
    : {
        _hover: {
          boxShadow: "xl",
        },
      };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Box
      {...cardStyles}
      {...clickableStyles}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {isCopyable && (
        <Tooltip
          label={hasCopied ? "Copied!" : "Copy value"}
          placement="top"
          hasArrow
        >
          <IconButton
            aria-label="Copy value"
            icon={<AppIcon component={FiCopy} />}
            size="xs"
            variant="ghost"
            colorScheme="blue"
            onClick={handleCopy}
            position="absolute"
            top="2"
            right="2"
            zIndex="base"
          />
        </Tooltip>
      )}
      <Flex align="center" w="full" gap="4">
        {StatIcon && (
          <AppIcon
            component={StatIcon}
            boxSize="10"
            color={iconColor}
            aria-hidden="true"
          />
        )}
        <VStack align="start" spacing="0">
          <Text fontSize="sm" color="textSecondary">
            {label}
          </Text>
          <Text fontSize="h5" fontWeight="bold" color="textPrimary">
            {value} {unit}
          </Text>
          {trend && trendValue && trend !== "neutral" && (
            <Flex align="center" gap="1">
              <AppIcon
                component={trend === "up" ? FiTrendingUp : FiTrendingDown}
                boxSize="4"
                color={trend === "up" ? "green.400" : "red.400"}
                aria-hidden="true"
              />
              <Text
                fontWeight="bold"
                fontSize="base"
                color={trend === "up" ? "green.400" : "red.400"}
              >
                {trendValue}
              </Text>
            </Flex>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  stats,
  isLoading,
  columns,
}) => {
  const defaultColumns = { base: 1, sm: 2, md: 3, lg: 4 };
  const showLoadingState = isLoading === undefined ? false : isLoading;

  if (showLoadingState) {
    return (
      <SimpleGrid
        columns={columns || defaultColumns}
        spacing="6"
        aria-busy="true"
      >
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} h="30" borderRadius="xl" />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={columns || defaultColumns} spacing="6">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </SimpleGrid>
  );
};

export default DashboardStatsGrid;
