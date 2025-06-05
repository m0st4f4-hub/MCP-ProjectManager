import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemoryObservationEditor from '../MemoryObservationEditor';
import type { MemoryObservation } from '@/types/memory';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock('@/services/api', () => ({
  memoryApi: {
    updateObservation: updateMock,
    deleteObservation: deleteMock,
  },
}));

describe('MemoryObservationEditor', () => {
  const user = userEvent.setup();
  const observation: MemoryObservation = {
    id: 1,
    entity_id: 1,
    content: 'initial',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('calls update and delete handlers', async () => {
    render(
      <TestWrapper>
        <MemoryObservationEditor observation={observation} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'updated');
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(updateMock).toHaveBeenCalledWith(1, { content: 'updated' });

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(deleteMock).toHaveBeenCalledWith(1);
  });
});
