"use client";

import React from "react";
import { HStack, Heading } from "@chakra-ui/react";
import { FaTasks } from "react-icons/fa";
import AppIcon from "../common/AppIcon";
import { semanticColors, sizing, typography } from "../../tokens";

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "Dashboard Overview",
}) => (
  <HStack justifyContent="space-between" alignItems="center">
    <HStack spacing={sizing.spacing[3] || 3} alignItems="center">
      <AppIcon
        component={FaTasks}
        w={sizing.spacing[8] || "32px"}
        h={sizing.spacing[8] || "32px"}
        color="icon.primary"
        mr={sizing.spacing[2] || 2}
        aria-hidden="true"
      />
      <Heading
        as="h1"
        size="xl"
        color={semanticColors.textPrimary?.DEFAULT || "inherit"}
        fontFamily={typography.fontFamily.heading.join(",")}
      >
        {title}
      </Heading>
    </HStack>
  </HStack>
);

export default DashboardHeader;
