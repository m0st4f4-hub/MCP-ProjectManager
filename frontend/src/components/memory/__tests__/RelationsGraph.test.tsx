import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, TestWrapper } from '@/__tests__/utils/test-utils';
import RelationsGraph from '../RelationsGraph';
import { memoryApi } from '@/services/api';

vi.mock('vis-network/standalone/esm/vis-network', () => ({
  Network: vi.fn(() => ({ destroy: vi.fn() })),
}));

vi.mock('@/services/api', () => ({
  memoryApi: {
    getRelations: vi.fn(),
  },
}));

describe('RelationsGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders graph when API resolves', async () => {
    (memoryApi.getRelations as any).mockResolvedValue([
      {
        id: 1,
        from_entity_id: 1,
        to_entity_id: 2,
        relation_type: 'linked',
        created_at: '',
      },
    ]);
    render(
      <TestWrapper>
        <RelationsGraph />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByTestId('relation-graph')).toBeInTheDocument();
    });
  });

  it('displays error when API rejects', async () => {
    (memoryApi.getRelations as any).mockRejectedValue(new Error('fail'));
    render(
      <TestWrapper>
        <RelationsGraph />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('fail')).toBeInTheDocument();
    });
  });
});
