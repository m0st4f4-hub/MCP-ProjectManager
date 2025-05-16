'use client';

import React from 'react';
import { useColorMode, IconButton } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import styles from './ThemeToggleButton.module.css';

export const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <IconButton
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      icon={isDark ? <FaSun /> : <FaMoon />}
      onClick={toggleColorMode}
      variant="ghost"
      size="lg"
      fontSize="xl"
      className={styles.toggleButton}
      tabIndex={0}
    />
  );
}; 