import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import ThemeToggleButton from '../ThemeToggleButton';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toggle function', async () => {
    const toggle = vi.fn();
    vi.mocked(require('@chakra-ui/react').useColorMode).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: toggle,
    } as any);

    render(<ThemeToggleButton />);
    await screen.getByRole('button').click();
    expect(toggle).toHaveBeenCalled();
  });
});
