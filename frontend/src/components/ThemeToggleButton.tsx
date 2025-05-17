"use client";

import React from "react";
import {
  useColorMode,
  IconButton,
  // Tooltip, // Unused
} from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { semanticColors } from "@/tokens/colors";
import AppIcon from "./common/AppIcon";
import { sizing } from "../tokens"; // Import sizing token

export const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define styles using semantic tokens. These will be applied via the sx prop.
  // Note: In a fully configured Chakra theme, some of these might be part of the 'ghost' variant itself.
  // This approach makes the intent clear and uses the new token system directly.
  const iconColor = isDark
    ? semanticColors.textSecondary.dark
    : semanticColors.textSecondary.DEFAULT;
  const hoverBg = isDark
    ? semanticColors.surfaceElevated.dark
    : semanticColors.surfaceElevated.DEFAULT;
  const focusRingColor = isDark
    ? semanticColors.borderFocused.dark
    : semanticColors.borderFocused.DEFAULT;

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      icon={<AppIcon component={isDark ? FaSun : FaMoon} />}
      onClick={toggleColorMode}
      variant="ghost" // Keep ghost for base styling and accessibility
      size="lg"
      // fontSize={typography.fontSize.xl} // If needed, use token
      minW="12" // Consider if these explicit sizes are needed or if theme's 'lg' size is sufficient
      minH="12"
      h="12"
      w="12"
      tabIndex={0}
      sx={{
        color: iconColor,
        _hover: {
          backgroundColor: hoverBg,
        },
        _focusVisible: {
          outlineColor: focusRingColor,
          outlineStyle: "solid",
          outlineWidth: sizing.borderWidth[2],
          boxShadow: `0 0 0 2px ${focusRingColor}`,
        },
      }}
    />
  );
};
