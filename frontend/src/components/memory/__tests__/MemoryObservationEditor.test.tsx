import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils';
import MemoryObservationEditor from '../MemoryObservationEditor';

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
    updateObservation: vi.fn(),
    deleteObservation: vi.fn(),
  },
}));

const { memoryApi } = await import('@/services/api');

const observation = {
  id: 1,
  entity_id: 1,
  content: 'initial',
  created_at: '2024-01-01T00:00:00Z',
};

describe('MemoryObservationEditor', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls update and delete handlers', async () => {
    (memoryApi.updateObservation as any).mockResolvedValue({
      ...observation,
      content: 'updated',
    });
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );
    await user.click(screen.getByRole('button', { name: /edit observation/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'updated');
    await user.click(screen.getByRole('button', { name: /save observation/i }));
    await waitFor(() =>
      expect(memoryApi.updateObservation).toHaveBeenCalledWith(1, {
        content: 'updated',
      })
    );

    await user.click(
      screen.getByRole('button', { name: /delete observation/i })
    );
    await waitFor(() =>
      expect(memoryApi.deleteObservation).toHaveBeenCalledWith(1)
    );
  });
});
