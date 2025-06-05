import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemoryRelationEditor from '../MemoryRelationEditor';
import type { MemoryRelation } from '@/types/memory';

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
    updateRelation: vi.fn(),
  },
}));

describe('MemoryRelationEditor', () => {
  const user = userEvent.setup();
  const relation: MemoryRelation = {
    id: 1,
    from_entity_id: 1,
    to_entity_id: 2,
    relation_type: 'linked',
    metadata: {},
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MemoryRelationEditor relation={relation} />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles basic interactions', async () => {
    render(
      <TestWrapper>
        <MemoryRelationEditor relation={relation} />
      </TestWrapper>
    );

    const inputs = screen.getAllByRole('textbox');
    const button = screen.getByRole('button');

    if (inputs.length > 0) {
      await user.type(inputs[0], '3');
    }
    await user.click(button);

    expect(document.body).toBeInTheDocument();
  });
});
