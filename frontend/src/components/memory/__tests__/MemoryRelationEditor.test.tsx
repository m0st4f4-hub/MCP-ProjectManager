import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils';
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

const { memoryApi } = await import('@/services/api');

describe('MemoryRelationEditor', () => {
  const user = userEvent.setup();
  const relation: MemoryRelation = {
    id: 1,
    from_entity_id: 2,
    to_entity_id: 3,
    relation_type: 'related',
    metadata: null,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and updates relation', async () => {
    (memoryApi.updateRelation as any).mockResolvedValue(relation);
    render(
      <TestWrapper>
        <MemoryRelationEditor relation={relation} />
      </TestWrapper>
    );

    const typeInput = screen.getByLabelText(/Relation Type/i);
    const metaInput = screen.getByLabelText(/Metadata/i);
    const button = screen.getByRole('button', { name: /save/i });

    await user.clear(typeInput);
    await user.type(typeInput, 'updated');
    await user.clear(metaInput);
    await user.type(metaInput, '{}');
    await user.click(button);

    await waitFor(() => expect(memoryApi.updateRelation).toHaveBeenCalled());
  });
});
