import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import TaskLoading from '../TaskLoading';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('TaskLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading text', () => {
    render(<TaskLoading />, { wrapper: TestWrapper });
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });
});
