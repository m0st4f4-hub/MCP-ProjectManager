import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemoryRelationEditor from '../MemoryRelationEditor';

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
    createRelation: vi.fn(),
    updateRelation: vi.fn(),
    deleteRelation: vi.fn(),
  },
}));

describe('MemoryRelationEditor', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders in create mode and submits data', async () => {
    const { memoryApi } = require('@/services/api');
    render(
      <TestWrapper>
        <MemoryRelationEditor />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole('textbox');
    if (inputs.length >= 3) {
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], 'rel');
    }
    const button = screen.getByRole('button', { name: /create/i });
    await user.click(button);
    expect(memoryApi.createRelation).toHaveBeenCalled();
  });

  it('renders in edit mode and calls update/delete', async () => {
    const { memoryApi } = require('@/services/api');
    const relation = {
      id: 1,
      from_entity_id: 1,
      to_entity_id: 2,
      relation_type: 'rel',
      created_at: '',
      metadata: null,
    };
    render(
      <TestWrapper>
        <MemoryRelationEditor relation={relation} />
      </TestWrapper>
    );
    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);
    expect(memoryApi.updateRelation).toHaveBeenCalled();
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    expect(memoryApi.deleteRelation).toHaveBeenCalled();
  });
});
