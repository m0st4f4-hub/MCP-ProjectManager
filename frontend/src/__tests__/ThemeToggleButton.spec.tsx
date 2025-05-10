// Task ID: 212
// Agent Role: FrontendAgent
// Timestamp: YYYY-MM-DDTHH:MM:SSZ

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggleButton from '../components/ThemeToggleButton'; // Corrected path
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggleButton', () => {
  it('renders correctly and calls setTheme on click', () => {
    const mockSetTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggleButton />);

    // Check if the button is rendered (icon might be tricky to assert directly without specific selectors)
    // Let's assume it has a button role
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Simulate a click
    fireEvent.click(button);

    // Check if setTheme was called to toggle to dark mode
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles to light mode if current theme is dark', () => {
    const mockSetTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<ThemeToggleButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
}); 