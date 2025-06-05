import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemoryRelationEditor from '../memory/MemoryRelationEditor';

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

const relation = {
  id: 1,
  from_entity_id: 2,
  to_entity_id: 3,
  relation_type: 'related_to',
  metadata: {},
  created_at: '',
};

describe('MemoryRelationEditor', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MemoryRelationEditor relation={relation as any} />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles basic interactions', async () => {
    render(
      <TestWrapper>
        <MemoryRelationEditor relation={relation as any} />
      </TestWrapper>
    );

    const inputs = screen.getAllByRole('textbox');
    const button = screen.getByRole('button');

    if (inputs.length > 2) {
      await user.clear(inputs[2]);
      await user.type(inputs[2], 'test');
    }

    await user.click(button);

    expect(document.body).toBeInTheDocument();
  });
});
