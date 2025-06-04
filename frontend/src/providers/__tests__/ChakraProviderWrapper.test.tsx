import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChakraProviderWrapper from '../ChakraProviderWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import { useColorMode } from '@chakra-ui/react';

const Consumer = () => {
  const { theme, toggleTheme } = useTheme();
  const { colorMode } = useColorMode();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="colorMode">{colorMode}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
};

describe('ChakraProviderWrapper', () => {
  it('applies stored theme on mount and syncs color mode', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ChakraProviderWrapper>
        <Consumer />
      </ChakraProviderWrapper>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('colorMode').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggleTheme updates context and chakra color mode', async () => {
    localStorage.setItem('theme', 'light');
    const user = userEvent.setup();

    render(
      <ChakraProviderWrapper>
        <Consumer />
      </ChakraProviderWrapper>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');

    await user.click(screen.getByRole('button'));

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('colorMode').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
