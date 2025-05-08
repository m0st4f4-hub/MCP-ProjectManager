'use client';

import React from 'react';
import { useColorMode, IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons'; // Use Chakra icons

export const ThemeToggleButton: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      variant="ghost" // Use ghost for subtle appearance
      size="md"
      // Optional: Add tooltip for clarity
    />
    // Previous button implementation removed
    // <Button onClick={toggleTheme} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
    //   Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    // </Button>
  );
}; 