// Task ID: 212
// Agent Role: FrontendAgent
// Timestamp: YYYY-MM-DDTHH:MM:SSZ

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggleButton } from '../components/ThemeToggleButton'; // Corrected import name to match export
import { useColorMode } from '@chakra-ui/react';

// Mock @chakra-ui/react useColorMode hook
jest.mock('@chakra-ui/react', () => ({
  // Preserve other exports from @chakra-ui/react if needed by the component
  ...jest.requireActual('@chakra-ui/react'), 
  useColorMode: jest.fn(),
  IconButton: jest.fn(({ "aria-label": ariaLabel, icon, onClick, ...props }) => (
    <button aria-label={ariaLabel} onClick={onClick} {...props}>
      {/* Render icon's type if it's a simple element, or a placeholder */}
      {icon && typeof icon.type === 'function' ? React.createElement(icon.type) : 'ICON'}
    </button>
  )),
}));

describe('ThemeToggleButton', () => {
  it('renders correctly and calls toggleColorMode on click when light', () => {
    const mockToggleColorMode = jest.fn();
    (useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    });

    render(<ThemeToggleButton />);

    // Check if the button is rendered (icon might be tricky to assert directly without specific selectors)
    // Let's assume it has a button role
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Simulate a click
    fireEvent.click(button);

    // Check if toggleColorMode was called
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1); // Check if called
  });

  it('toggles correctly when dark', () => {
    const mockToggleColorMode = jest.fn();
    (useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });

    render(<ThemeToggleButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Check if toggleColorMode was called
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1); // Check if called
  });
}); 