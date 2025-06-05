import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, TestWrapper } from '@/__tests__/utils/test-utils';
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
    searchGraph: vi.fn(),
  },
}));

const { memoryApi } = await import('@/services/api');

describe('MemorySearch', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends search request and renders results', async () => {
    (memoryApi.searchGraph as any).mockResolvedValue({
      data: [
        { id: 1, entity_type: 'file', content: 'doc', created_at: '2024' },
      ],
    });

    render(
      <TestWrapper>
        <MemorySearch />
      </TestWrapper>
    );

    const input = screen.getByTestId('memory-search-input');
    await user.type(input, 'query');
    await user.click(screen.getByTestId('memory-search-button'));

    await waitFor(() =>
      expect(memoryApi.searchGraph).toHaveBeenCalledWith('query')
    );
    await waitFor(() => expect(screen.getByRole('link')).toHaveAttribute('href', '/memory/1'));
  });
});
