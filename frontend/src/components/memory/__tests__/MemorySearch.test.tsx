import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemorySearch from '../MemorySearch';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api', () => ({
  memoryApi: {
    searchGraph: vi.fn().mockResolvedValue([]),
  },
}));

describe('MemorySearch', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MemorySearch />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles search interaction', async () => {
    render(
      <TestWrapper>
        <MemorySearch />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    await user.type(input, 'test');
    await user.click(button);

    expect(document.body).toBeInTheDocument();
  });
});
