"use client";

import React from "react";
import { useColorMode, IconButton } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext.js";
import AppIcon from "../common/AppIcon";

export const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { toggleTheme } = useTheme();
  const isDark = colorMode === "dark";

  const handleToggle = () => {
    toggleColorMode();
    toggleTheme();
  };

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      icon={<AppIcon component={isDark ? FaSun : FaMoon} />}
      onClick={handleToggle}
      variant="ghost"
      size="lg"
      fontSize="xl"
      minW="12"
      minH="12"
      h="12"
      w="12"
      tabIndex={0}
    />
  );
};
