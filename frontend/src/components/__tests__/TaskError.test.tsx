import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import TaskError from '../TaskError';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('TaskError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays error and retry', async () => {
    const retry = vi.fn();
    render(<TaskError error="Oops" onRetry={retry} />, { wrapper: TestWrapper });
    expect(screen.getByText('Oops')).toBeInTheDocument();
    await screen.getByRole('button', { name: /retry/i }).click();
    expect(retry).toHaveBeenCalled();
  });
});
