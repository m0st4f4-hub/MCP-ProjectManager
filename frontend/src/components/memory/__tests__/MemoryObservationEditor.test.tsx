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
  content: 'test',
  created_at: '2024-01-01',
};

describe('MemoryObservationEditor', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates observation', async () => {
    (memoryApi.updateObservation as any).mockResolvedValue({
      ...observation,
      content: 'new',
    });
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const textbox = screen.getByRole('textbox');
    await user.clear(textbox);
    await user.type(textbox, 'new');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(memoryApi.updateObservation).toHaveBeenCalledWith(1, {
        content: 'new',
      })
    );
  });

  it('deletes observation', async () => {
    (memoryApi.deleteObservation as any).mockResolvedValue(undefined);
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() =>
      expect(memoryApi.deleteObservation).toHaveBeenCalledWith(1)
    );
  });
});
