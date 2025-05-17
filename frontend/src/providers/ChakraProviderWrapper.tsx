"use client";

import React, { useEffect } from "react";
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import baseAppTheme from "../theme/chakra-theme"; // Import our new custom theme
import ModalProvider from "./ModalProvider";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

// Inner component to synchronize Chakra's color mode with ThemeContext
const ChakraSync = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme(); // Get theme from our context
  const { setColorMode } = useColorMode(); // Get Chakra's setColorMode

  useEffect(() => {
    // When our context's theme changes, update Chakra's color mode
    if (theme) {
      setColorMode(theme);
    }
  }, [theme, setColorMode]);

  return <>{children}</>;
};

export default function ChakraProviderWrapper({
  children,
}: ChakraProviderWrapperProps) {
  return (
    <ThemeProvider>
      <ChakraInternalProvider>{children}</ChakraInternalProvider>
    </ThemeProvider>
  );
}

// New component to access ThemeContext and pass it to ChakraProvider
const ChakraInternalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme: contextThemeValue } = useTheme(); // Renamed to avoid conflict with ChakraProvider's theme prop

  // Create a theme for Chakra that uses our baseAppTheme and the initial color mode from our context
  const dynamicChakraTheme = React.useMemo(
    () => ({
      ...baseAppTheme, // Spread our full custom theme
      config: {
        ...baseAppTheme.config, // Spread config from our custom theme
        initialColorMode:
          contextThemeValue || baseAppTheme.config.initialColorMode, // Set initial color mode from our context, fallback to theme's default
        // useSystemColorMode is already false in baseAppTheme.config
      },
      // Breakpoints are now part of baseAppTheme via sizing tokens and Tailwind defaults.
      // If specific overrides are needed here, they can be added.
      // For now, relying on the theme's breakpoints.
      // breakpoints: { ... },
    }),
    [contextThemeValue],
  );

  return (
    <ChakraProvider theme={dynamicChakraTheme}>
      <ChakraSync>
        {" "}
        {/* This component will keep Chakra's colorMode in sync */}
        <ModalProvider>{children}</ModalProvider>
      </ChakraSync>
    </ChakraProvider>
  );
};
