"use client";

import React from "react";
import {
  Box,
  Skeleton,
  SkeletonText,
  VStack,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { semanticColors } from "@/tokens/colors";
import { sizing } from '../tokens';

interface LoadingSkeletonProps {
  count?: number;
  type?: "task" | "project" | "agent";
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  type = "task",
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const skeletons = Array(count).fill(0);

  const itemBg = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;
  const itemBorderColor = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;

  const skeletonStartColor = isDark
    ? semanticColors.surfaceElevated.dark
    : semanticColors.surfaceElevated.DEFAULT;
  const skeletonEndColor = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;

  const commonItemProps = {
    p: "4",
    bg: itemBg,
    rounded: "lg",
    shadow: "lg",
    borderWidth: sizing.borderWidth.DEFAULT,
    borderColor: itemBorderColor,
  };

  const TaskSkeleton = () => (
    <Box {...commonItemProps} data-testid="skeleton-item">
      <VStack spacing="3" align="stretch">
        <Flex align="center" gap="4">
          <Skeleton
            height="20px"
            width="20px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
          <Skeleton
            height="20px"
            flex="1"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
        </Flex>
        <SkeletonText
          noOfLines={2}
          spacing={sizing.spacing[2]}
          startColor={skeletonStartColor}
          endColor={skeletonEndColor}
        />
        <Flex gap="2">
          <Skeleton
            height="16px"
            width="80px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
          <Skeleton
            height="16px"
            width="100px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
        </Flex>
      </VStack>
    </Box>
  );

  const ProjectSkeleton = () => (
    <Box {...commonItemProps} data-testid="skeleton-item">
      <VStack spacing="3" align="stretch">
        <Flex justify="space-between">
          <Skeleton
            height="24px"
            width="200px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
          <Skeleton
            height="24px"
            width="24px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
        </Flex>
        <SkeletonText
          noOfLines={2}
          spacing={sizing.spacing[2]}
          startColor={skeletonStartColor}
          endColor={skeletonEndColor}
        />
        <Box>
          <Flex justify="space-between" mb="2">
            <Flex gap="2">
              <Skeleton
                height="16px"
                width="80px"
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
              />
              <Skeleton
                height="16px"
                width="100px"
                startColor={skeletonStartColor}
                endColor={skeletonEndColor}
              />
            </Flex>
            <Skeleton
              height="16px"
              width="60px"
              startColor={skeletonStartColor}
              endColor={skeletonEndColor}
            />
          </Flex>
          <Skeleton
            height="8px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
        </Box>
      </VStack>
    </Box>
  );

  const AgentSkeleton = () => (
    <Flex
      {...commonItemProps}
      justifyContent="space-between"
      alignItems="center"
      data-testid="skeleton-item"
    >
      <VStack align="start" spacing="2">
        <Skeleton
          height="24px"
          width="180px"
          startColor={skeletonStartColor}
          endColor={skeletonEndColor}
        />
        <Flex gap="2">
          <Skeleton
            height="16px"
            width="80px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
          <Skeleton
            height="16px"
            width="60px"
            startColor={skeletonStartColor}
            endColor={skeletonEndColor}
          />
        </Flex>
      </VStack>
      <Skeleton
        height="32px"
        width="32px"
        startColor={skeletonStartColor}
        endColor={skeletonEndColor}
      />
    </Flex>
  );

  const SkeletonComponent = {
    task: TaskSkeleton,
    project: ProjectSkeleton,
    agent: AgentSkeleton,
  }[type];

  return (
    <VStack spacing="4" align="stretch" w="full">
      {skeletons.map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </VStack>
  );
};

export default React.memo(LoadingSkeleton);
