import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemoryObservationEditor from '../MemoryObservationEditor';
import type { MemoryObservation } from '@/types/memory';
import { memoryApi } from '@/services/api';

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

const observation: MemoryObservation = {
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

  it('calls updateObservation on save', async () => {
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    const textbox = screen.getByRole('textbox');
    await user.clear(textbox);
    await user.type(textbox, 'updated');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(memoryApi.updateObservation).toHaveBeenCalled();
  });

  it('calls deleteObservation on delete', async () => {
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(memoryApi.deleteObservation).toHaveBeenCalled();
  });
});
